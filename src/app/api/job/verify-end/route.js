import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import JobSession from '@/models/JobSession';
import Booking from '@/models/Booking';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import Transaction from '@/models/Transaction';
import { createAndSendNotification } from '@/lib/notificationHelper';
import { calculateCombinedOvertime } from '@/utils/overtimeCalculator';

/**
 * POST /api/job/verify-end
 * Verify end OTP, calculate duration and overtime, process payment
 */
export async function POST(request) {
  try {
    await connectDB();

    const { jobSessionId, otp, providerId } = await request.json();

    if (!jobSessionId || !otp) {
      return NextResponse.json(
        { success: false, message: 'Job session ID and OTP are required' },
        { status: 400 }
      );
    }

    // Find job session
    const jobSession = await JobSession.findById(jobSessionId)
      .populate('booking')
      .populate('customer')
      .populate('provider');

    if (!jobSession) {
      return NextResponse.json(
        { success: false, message: 'Job session not found' },
        { status: 404 }
      );
    }

    // Verify provider
    if (jobSession.provider._id.toString() !== providerId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Verify job is pending end
    if (jobSession.status !== 'pending_end') {
      return NextResponse.json(
        { success: false, message: 'Job is not ready to be completed' },
        { status: 400 }
      );
    }

    // Check OTP expiry
    if (new Date() > jobSession.endOTPExpiry) {
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = jobSession.verifyOTP(otp, jobSession.endOTP);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // End the job
    jobSession.endTime = new Date();
    jobSession.endOTPVerified = true;
    jobSession.endOTPPlain = null; // Clear plain OTP for security

    // Calculate overtime
    const overtimeData = jobSession.calculateOvertime();
    jobSession.duration = overtimeData.duration;
    jobSession.overtimeDuration = overtimeData.overtimeDuration;
    jobSession.overtimeCharge = overtimeData.overtimeCharge;
    jobSession.totalCharge = overtimeData.totalCharge;
    jobSession.status = 'completed';

    await jobSession.save();

    // Update booking
    const booking = await Booking.findById(jobSession.booking);
    booking.status = 'completed';
    booking.completedAt = jobSession.endTime;

    // NEW: Calculate overtime for hourly bookings
    if (booking.hourlyBookingDetails && booking.hourlyBookingDetails.bookedHours) {
      const hourlyDetails = booking.hourlyBookingDetails;
      hourlyDetails.actualEndTime = jobSession.endTime;

      // Calculate actual hours worked
      const actualMs = jobSession.endTime - jobSession.startTime;
      const actualHours = Number((actualMs / (1000 * 60 * 60)).toFixed(2));
      hourlyDetails.actualHours = actualHours;

      // Use combined overtime calculator
      const overtimeResult = calculateCombinedOvertime({
        bookedMinutes: hourlyDetails.bookedHours * 60,
        actualStartTime: jobSession.startTime,
        actualEndTime: jobSession.endTime,
        shiftEndTime: hourlyDetails.partnerShiftEnd,
        hourlyRate: hourlyDetails.hourlyRate
      });

      // Update hourly booking details with overtime
      hourlyDetails.overtimeHours = Number((overtimeResult.bookingOvertimeMinutes / 60).toFixed(2));
      hourlyDetails.overtimeCost = overtimeResult.bookingOvertimeCost;
      hourlyDetails.shiftOvertimeHours = Number((overtimeResult.shiftOvertimeMinutes / 60).toFixed(2));
      hourlyDetails.shiftOvertimeCost = overtimeResult.shiftOvertimeCost;
      hourlyDetails.totalHourlyCharge = overtimeResult.totalCost;
      hourlyDetails.overtimeType = overtimeResult.overtimeType;

      // Update booking total price
      const extrasTotal = booking.extras?.reduce((sum, extra) => sum + (extra?.price || 0), 0) || 0;
      booking.totalPrice = overtimeResult.totalCost + extrasTotal;

      booking.markModified('hourlyBookingDetails');

      // Process overtime payment if applicable
      const totalOvertimeCost = overtimeResult.bookingOvertimeCost + overtimeResult.shiftOvertimeCost;

      if (totalOvertimeCost > 0) {
        // Use MongoDB transaction for atomic wallet operations
        const session = await Homeowner.startSession();
        session.startTransaction();

        try {
          // Charge customer
          const customer = await Homeowner.findById(jobSession.customer).session(session);

          // Deduct from wallet if payment method was wallet
          if (booking.paymentMethod === 'wallet' && customer.wallet) {
            if (customer.wallet.balance >= totalOvertimeCost) {
              customer.wallet.balance -= totalOvertimeCost;
              await customer.save({ session });

              // Create transaction record
              await Transaction.create([{
                user: customer._id,
                userType: 'homeowner',
                type: 'debit',
                amount: totalOvertimeCost,
                description: `Overtime charges for ${booking.serviceName} (${overtimeResult.overtimeType})`,
                status: 'completed',
                relatedBooking: booking._id
              }], { session });

              // Credit provider wallet
              const provider = await ServiceProvider.findById(jobSession.provider).session(session);
              if (provider.wallet) {
                provider.wallet.balance += totalOvertimeCost;
                await provider.save({ session });

                // Create transaction record
                await Transaction.create([{
                  user: provider._id,
                  userType: 'provider',
                  type: 'credit',
                  amount: totalOvertimeCost,
                  description: `Overtime payment for ${booking.serviceName} (${overtimeResult.overtimeType})`,
                  status: 'completed',
                  relatedBooking: booking._id
                }], { session });
              }

              // Commit the transaction
              await session.commitTransaction();
            } else {
              // Insufficient balance - abort transaction
              await session.abortTransaction();
              console.warn(`Insufficient wallet balance for overtime charge: ${customer._id}`);
            }
          } else {
            // Not wallet payment - abort transaction
            await session.abortTransaction();
          }
        } catch (error) {
          // Rollback on error
          await session.abortTransaction();
          console.error('Wallet transaction failed:', error);
          throw error;
        } finally {
          session.endSession();
        }
      }

    } else if (overtimeData.overtimeCharge > 0) {
      // Legacy overtime handling (backward compatibility)
      booking.totalPrice += overtimeData.overtimeCharge;

      // Use MongoDB transaction for atomic wallet operations
      const session = await Homeowner.startSession();
      session.startTransaction();

      try {
        // Process overtime payment
        const customer = await Homeowner.findById(jobSession.customer).session(session);

        // Deduct from wallet if payment method was wallet
        if (booking.paymentMethod === 'wallet' && customer.wallet) {
          if (customer.wallet.balance >= overtimeData.overtimeCharge) {
            customer.wallet.balance -= overtimeData.overtimeCharge;
            await customer.save({ session });

            // Create transaction record
            await Transaction.create([{
              user: customer._id,
              userType: 'homeowner',
              type: 'debit',
              amount: overtimeData.overtimeCharge,
              description: `Overtime charges for ${booking.serviceName}`,
              status: 'completed',
              relatedBooking: booking._id
            }], { session });

            // Credit provider wallet
            const provider = await ServiceProvider.findById(jobSession.provider).session(session);
            if (provider.wallet) {
              provider.wallet.balance += overtimeData.overtimeCharge;
              await provider.save({ session });

              // Create transaction record
              await Transaction.create([{
                user: provider._id,
                userType: 'provider',
                type: 'credit',
                amount: overtimeData.overtimeCharge,
                description: `Overtime payment for ${booking.serviceName}`,
                status: 'completed',
                relatedBooking: booking._id
              }], { session });
            }

            // Commit the transaction
            await session.commitTransaction();
          } else {
            // Insufficient balance - abort transaction
            await session.abortTransaction();
            console.warn(`Insufficient wallet balance for overtime charge: ${customer._id}`);
          }
        } else {
          // Not wallet payment - abort transaction
          await session.abortTransaction();
        }
      } catch (error) {
        // Rollback on error
        await session.abortTransaction();
        console.error('Wallet transaction failed:', error);
        throw error;
      } finally {
        session.endSession();
      }
    }

    await booking.save();

    // Notify customer that job is completed
    const homeowner = await Homeowner.findById(jobSession.customer);
    if (homeowner) {
      // Check if completion payment is needed (wallet payment with 75% remaining)
      const needsCompletionPayment = 
        booking.paymentMethod === 'wallet' && 
        booking.walletPaymentStage === 'initial_25_released';

      const completionAmount = booking.escrowDetails?.completionAmount || (booking.totalPrice * 0.75);

      await createAndSendNotification({
        title: needsCompletionPayment ? '💰 Payment Required' : '✅ Job Completed',
        message: needsCompletionPayment 
          ? `Job completed! Please pay ₹${completionAmount} (75%) to settle the booking for ${booking.serviceName}.`
          : `The job ${booking.serviceName} is completed. Total: ₹${jobSession.totalCharge}`,
        recipientId: jobSession.customer.toString(),
        recipientType: 'homeowner',
        pushToken: homeowner.pushToken,
        type: needsCompletionPayment ? 'payment_required' : 'job_completed',
        data: { 
          bookingId: booking._id.toString(),
          action: needsCompletionPayment ? 'pay_completion' : 'view_booking',
          completionAmount: needsCompletionPayment ? completionAmount : undefined
        },
        bookingId: booking._id.toString()
      });
    }



    // Prepare response data
    let responseData = {
      endTime: jobSession.endTime,
      duration: overtimeData.duration,
      expectedDuration: jobSession.expectedDuration,
      status: jobSession.status
    };

    // Add hourly booking overtime details if applicable
    if (booking.hourlyBookingDetails && booking.hourlyBookingDetails.bookedHours) {
      responseData.overtime = {
        type: booking.hourlyBookingDetails.overtimeType,
        actualHours: booking.hourlyBookingDetails.actualHours,
        bookedHours: booking.hourlyBookingDetails.bookedHours,
        overtimeHours: booking.hourlyBookingDetails.overtimeHours,
        overtimeCost: booking.hourlyBookingDetails.overtimeCost,
        shiftOvertimeHours: booking.hourlyBookingDetails.shiftOvertimeHours,
        shiftOvertimeCost: booking.hourlyBookingDetails.shiftOvertimeCost
      };
      responseData.charges = {
        baseCost: booking.hourlyBookingDetails.baseCost,
        overtimeCost: booking.hourlyBookingDetails.overtimeCost,
        shiftOvertimeCost: booking.hourlyBookingDetails.shiftOvertimeCost,
        totalCharge: booking.hourlyBookingDetails.totalHourlyCharge
      };
    } else {
      // Legacy overtime response
      responseData.overtimeDuration = overtimeData.overtimeDuration;
      responseData.overtimeCharge = overtimeData.overtimeCharge;
      responseData.totalCharge = overtimeData.totalCharge;
    }

    return NextResponse.json({
      success: true,
      message: 'Job completed successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error verifying end OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to complete job', error: error.message },
      { status: 500 }
    );
  }
}
