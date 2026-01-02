import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import JobSession from '@/models/JobSession';
import Booking from '@/models/Booking';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import Transaction from '@/models/Transaction';
import { createAndSendNotification } from '@/lib/notificationHelper';

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

    // If there's overtime, update total price
    if (overtimeData.overtimeCharge > 0) {
      booking.totalPrice += overtimeData.overtimeCharge;
    }

    await booking.save();

    // Notify customer that job is completed
    const homeowner = await Homeowner.findById(jobSession.customer);
    if (homeowner) {
        await createAndSendNotification({
            title: '✅ Job Completed',
            message: `The job ${booking.serviceName} is completed. Total: ₹${jobSession.totalCharge}`,
            recipientId: jobSession.customer.toString(),
            recipientType: 'homeowner',
            pushToken: homeowner.pushToken,
            type: 'job_completed',
            data: { bookingId: booking._id.toString() },
            bookingId: booking._id.toString()
        });
    }

    // Process overtime payment if applicable
    if (overtimeData.overtimeCharge > 0) {
      // Charge customer
      const customer = await Homeowner.findById(jobSession.customer);
      
      // Deduct from wallet if payment method was wallet
      if (booking.paymentMethod === 'wallet' && customer.wallet) {
        if (customer.wallet.balance >= overtimeData.overtimeCharge) {
          customer.wallet.balance -= overtimeData.overtimeCharge;
          await customer.save();

          // Create transaction record
          await Transaction.create({
            user: customer._id,
            userType: 'homeowner',
            type: 'debit',
            amount: overtimeData.overtimeCharge,
            description: `Overtime charges for ${booking.serviceName}`,
            status: 'completed',
            relatedBooking: booking._id
          });
        }
      }

      // Credit provider wallet
      const provider = await ServiceProvider.findById(jobSession.provider);
      if (provider.wallet) {
        provider.wallet.balance += overtimeData.overtimeCharge;
        await provider.save();

        // Create transaction record
        await Transaction.create({
          user: provider._id,
          userType: 'provider',
          type: 'credit',
          amount: overtimeData.overtimeCharge,
          description: `Overtime payment for ${booking.serviceName}`,
          status: 'completed',
          relatedBooking: booking._id
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Job completed successfully',
      data: {
        endTime: jobSession.endTime,
        duration: overtimeData.duration,
        expectedDuration: jobSession.expectedDuration,
        overtimeDuration: overtimeData.overtimeDuration,
        overtimeCharge: overtimeData.overtimeCharge,
        totalCharge: overtimeData.totalCharge,
        status: jobSession.status
      }
    });

  } catch (error) {
    console.error('Error verifying end OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to complete job', error: error.message },
      { status: 500 }
    );
  }
}
