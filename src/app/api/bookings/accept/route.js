import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import ResidentRequest from '@/models/ResidentRequest';
import Homeowner from '@/models/Homeowner';
import Transaction from '@/models/Transaction';
import JobSession from '@/models/JobSession';
import { sendBookingAcceptedWithOTPNotification } from '@/lib/sendPushNotification';

export async function POST(request) {
  try {
    await connectDB();

    const { bookingId, providerId, providerName } = await request.json();

    if (!bookingId || !providerId) {
      return NextResponse.json(
        { success: false, message: 'Booking ID and Provider ID are required' },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if already accepted by someone
    if (booking.status === 'accepted') {
      return NextResponse.json(
        { success: false, message: 'This booking has already been accepted by another provider' },
        { status: 400 }
      );
    }

    // Verify provider exists and offers this service
    const provider = await ServiceProvider.findById(providerId);
    
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    if (!provider.services.includes(booking.serviceName)) {
      return NextResponse.json(
        { success: false, message: 'Provider does not offer this service' },
        { status: 400 }
      );
    }

    // Update booking
    booking.status = 'accepted';
    booking.assignedProvider = providerId;
    booking.providerName = providerName || provider.name;

    if (booking.negotiation && booking.negotiation.isActive) {
      booking.negotiation.isActive = false;
      booking.negotiation.status = 'accepted';
      booking.negotiation.respondedAt = new Date();
    }
    
    // Add to provider responses
    booking.providerResponses.push({
      providerId: providerId,
      response: 'accepted',
      respondedAt: new Date()
    });

    await booking.save();

    // 💰 ESCROW TRANSFER: If payment was via wallet, transfer to provider's wallet
    if (booking.paymentMethod === 'wallet' && booking.paymentStatus === 'paid') {
      const transferAmount = booking.totalPrice;
      
      // Initialize provider wallet if not exists
      if (!provider.wallet) {
        provider.wallet = { balance: 0, currency: 'INR' };
      }
      
      const providerBalanceBefore = provider.wallet.balance || 0;
      
      // Add to provider's wallet
      provider.wallet.balance = providerBalanceBefore + transferAmount;
      await provider.save();
      
      // Create transaction record for provider ONLY (no customerId)
      // This ensures it only appears in provider's wallet, not member's wallet
      await Transaction.create({
        bookingId: bookingId,
        providerId: providerId,
        // customerId is intentionally NOT included - this is provider's earning
        type: 'wallet_credit',
        amount: transferAmount,
        balanceBefore: providerBalanceBefore,
        balanceAfter: provider.wallet.balance,
        description: `Earnings from booking #${bookingId}: ${booking.serviceName}`,
        status: 'completed',
        paymentMethod: 'wallet',
        currency: 'INR',
        serviceName: booking.serviceName,
        serviceCategory: booking.serviceCategory
      });
      
      console.log(`💰 ESCROW RELEASED: Transferred ₹${transferAmount} to provider ${provider.name}'s wallet`);
    }

    if (booking.residentRequest) {
      const requestUpdate = {
        status: 'accepted',
        scheduledFor: booking.bookingDate
      };

      if (booking.negotiation) {
        requestUpdate.negotiation = {
          ...booking.negotiation,
          providerId: booking.negotiation.providerId,
          providerName: booking.negotiation.providerName,
          proposedAmount: booking.negotiation.proposedAmount,
          isActive: false,
          status: booking.negotiation.status,
          updatedAt: new Date()
        };
      }

      await ResidentRequest.findByIdAndUpdate(booking.residentRequest, { $set: requestUpdate });
    }

    // Create job session with first OTP
    let jobSession = await JobSession.findOne({ booking: bookingId });
    
    if (!jobSession) {
      // Get provider's working hours for expected duration
      const expectedDuration = provider.workingHours 
        ? calculateExpectedDuration(provider.workingHours)
        : 480; // Default 8 hours

      // Get base hourly rate from booking
      const baseHourlyRate = booking.totalPrice / (expectedDuration / 60);
      const overtimeRate = baseHourlyRate * 1.5;

      // Create new job session
      jobSession = new JobSession({
        booking: bookingId,
        provider: providerId,
        customer: booking.customerId,
        expectedDuration,
        baseHourlyRate,
        overtimeRate,
        status: 'pending_start'
      });

      // Generate start OTP
      const { otp, hash } = jobSession.generateOTP();
      jobSession.startOTP = hash;
      jobSession.startOTPPlain = otp; // Store plain for customer display
      jobSession.startOTPExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      jobSession.startOTPVerified = false;

      await jobSession.save();

      // Update booking with job session reference
      booking.jobSession = jobSession._id;
      await booking.save();

      console.log(`🔐 Generated start OTP for booking ${bookingId}: ${otp}`);

      // Send push notification to member with OTP
      const homeowner = await Homeowner.findById(booking.customerId);
      if (homeowner?.pushToken && homeowner?.pushNotificationsEnabled) {
        try {
          await sendBookingAcceptedWithOTPNotification(
            homeowner.pushToken,
            booking.serviceName,
            providerName,
            otp,
            booking._id.toString()
          );
          console.log(`📱 Push notification with OTP sent to member: ${homeowner.name}`);
        } catch (notifError) {
          console.error('Failed to send push notification:', notifError);
          // Don't fail the acceptance if notification fails
        }
      }
    } else {
      console.log(`⚠️ Job session already exists for booking ${bookingId}`);
      // Send notification without OTP generation
      const homeowner = await Homeowner.findById(booking.customerId);
      if (homeowner?.pushToken && homeowner?.pushNotificationsEnabled) {
        try {
          await sendBookingAcceptedWithOTPNotification(
            homeowner.pushToken,
            booking.serviceName,
            providerName,
            jobSession.startOTPPlain || 'N/A',
            booking._id.toString()
          );
          console.log(`📱 Push notification sent to member: ${homeowner.name}`);
        } catch (notifError) {
          console.error('Failed to send push notification:', notifError);
        }
      }
    }
    
    console.log(`✅ Booking ${bookingId} accepted by ${providerName}`);

    return NextResponse.json({
      success: true,
      message: 'Booking accepted successfully!',
      booking: {
        id: booking._id,
        serviceName: booking.serviceName,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerAddress: booking.customerAddress,
        bookingDate: booking.formattedDate,
        bookingTime: booking.bookingTime,
        totalPrice: booking.totalPrice,
        status: booking.status
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Booking acceptance error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to accept booking',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

 
 
// Helper function to calculate expected duration from working hours
function calculateExpectedDuration(workingHours) {
  if (!workingHours || !workingHours.startTime || !workingHours.endTime) {
    return 480; // Default 8 hours
  }

  const [startHours, startMinutes] = workingHours.startTime.split(':').map(Number);
  const [endHours, endMinutes] = workingHours.endTime.split(':').map(Number);

  const startInMinutes = startHours * 60 + startMinutes;
  const endInMinutes = endHours * 60 + endMinutes;

  return endInMinutes - startInMinutes;
}
