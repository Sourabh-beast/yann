import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import ResidentRequest from '@/models/ResidentRequest';
import Homeowner from '@/models/Homeowner';
import Transaction from '@/models/Transaction';

export async function POST(request) {
  try {
    await connectDB();

    const { bookingId, providerId, reason } = await request.json();

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

    // Add to provider responses
    booking.providerResponses.push({
      providerId: providerId,
      response: 'rejected',
      respondedAt: new Date(),
      rejectionReason: reason || 'Not specified'
    });

    await booking.save();

    // CRITICAL DEBUG: Check assignment and refund logic
    let isAssignedProviderRejection = false;
    if (booking.assignedProvider) {
      isAssignedProviderRejection = booking.assignedProvider.toString() === providerId.toString();
      console.log(`🔍 Booking Assignment Check: Assigned=${booking.assignedProvider}, Requesting=${providerId}, Match=${isAssignedProviderRejection}`);
    } else {
      console.log(`🔍 Booking Assignment Check: Not assigned to specific provider (Broadcast)`);
    }

    // Check if all providers have rejected (for broadcast bookings)
    const allProviders = await ServiceProvider.find({
      services: booking.serviceName,
      status: 'active'
    });

    // Count rejections including this one (since we just pushed it)
    const rejectedCount = booking.providerResponses.filter(r => r.response === 'rejected').length;

    console.log(`📊 Rejection Stats: Total Active Providers=${allProviders.length}, Rejected Count=${rejectedCount}`);

    const shouldRefund = isAssignedProviderRejection || (rejectedCount >= allProviders.length);

    console.log(`🤔 Should Refund? ${shouldRefund} (Assigned=${isAssignedProviderRejection}, AllRejected=${rejectedCount >= allProviders.length})`);

    if (shouldRefund) {
      booking.status = 'rejected';
      if (booking.negotiation && booking.negotiation.isActive) {
        booking.negotiation.isActive = false;
        booking.negotiation.status = 'declined';
        booking.negotiation.respondedAt = new Date();
      }
      await booking.save();

      console.log(`🔴 Booking rejected. Reason: ${isAssignedProviderRejection ? 'Assigned provider rejected' : 'All providers rejected'}`);

      // 💰 ESCROW REFUND: Handle wallet payment refunds based on staging
      if (booking.paymentMethod === 'wallet') {
        const homeowner = await Homeowner.findById(booking.customerId);

        if (homeowner) {
          // Initialize wallet if not exists
          if (!homeowner.wallet) {
            homeowner.wallet = { balance: 0, currency: 'INR' };
          }

          const customerBalanceBefore = homeowner.wallet.balance || 0;

          // NEW: Check for staged payment (25% escrow)
          if (booking.walletPaymentStage === 'initial_25_held') {
            // Refund only the 25% that was held in escrow
            const refundAmount = booking.escrowDetails?.initialAmount || booking.totalPrice * 0.25;

            // Add back to customer's wallet
            homeowner.wallet.balance = customerBalanceBefore + refundAmount;
            await homeowner.save();

            // Update booking escrow status
            booking.walletPaymentStage = 'none';
            booking.escrowDetails.initialRefundedAt = new Date();
            booking.paymentStatus = 'refunded';
            await booking.save();

            // Create escrow_refund transaction record
            await Transaction.create({
              bookingId: bookingId,
              customerId: booking.customerId,
              type: 'escrow_refund',
              amount: refundAmount,
              balanceBefore: customerBalanceBefore,
              balanceAfter: homeowner.wallet.balance,
              escrowStatus: 'refunded',
              paymentStage: 'initial_25',
              description: `25% booking deposit refunded (₹${refundAmount}) - All providers rejected`,
              status: 'completed',
              paymentMethod: 'wallet',
              currency: 'INR',
              serviceName: booking.serviceName,
              serviceCategory: booking.serviceCategory
            });

            console.log(`💰 ESCROW REFUNDED (25%): Returned ₹${refundAmount} to customer ${homeowner.name}'s wallet`);
          }
          // LEGACY: Handle old full-amount escrow bookings (backward compatibility)
          else if (booking.paymentStatus === 'paid' && !booking.walletPaymentStage) {
            const refundAmount = booking.totalPrice;

            // Add back to customer's wallet
            homeowner.wallet.balance = customerBalanceBefore + refundAmount;
            await homeowner.save();

            // Create refund transaction record
            await Transaction.create({
              bookingId: bookingId,
              customerId: booking.customerId,
              type: 'wallet_refund',
              amount: refundAmount,
              balanceBefore: customerBalanceBefore,
              balanceAfter: homeowner.wallet.balance,
              description: `Refund for rejected booking #${bookingId}: ${booking.serviceName}`,
              status: 'completed',
              paymentMethod: 'wallet',
              currency: 'INR',
              serviceName: booking.serviceName,
              serviceCategory: booking.serviceCategory
            });

            // Update booking payment status
            booking.paymentStatus = 'refunded';
            await booking.save();

            console.log(`💰 ESCROW REFUNDED (LEGACY): Returned ₹${refundAmount} to customer ${homeowner.name}'s wallet`);
          }
        }
      }

      if (booking.residentRequest) {
        const requestUpdate = { status: 'denied' };
        if (booking.negotiation) {
          requestUpdate.negotiation = {
            ...booking.negotiation,
            isActive: false,
            status: 'declined',
            updatedAt: new Date()
          };
        }
        await ResidentRequest.findByIdAndUpdate(booking.residentRequest, { $set: requestUpdate });
      }

      // Send push notification to member when all providers reject
      const homeowner = await Homeowner.findById(booking.customerId);
      if (homeowner?.pushToken && homeowner?.pushNotificationsEnabled) {
        try {
          const { sendBookingRejectedNotification } = await import('@/lib/sendPushNotification');
          await sendBookingRejectedNotification(
            homeowner.pushToken,
            booking.serviceName,
            booking._id.toString()
          );
          console.log(`📱 Push notification sent to member: ${homeowner.name}`);
        } catch (notifError) {
          console.error('Failed to send push notification:', notifError);
          // Don't fail the rejection if notification fails
        }
      }

      console.log(`❌ All providers rejected booking ${bookingId}`);
    }

    console.log(`⏭️ Provider rejected booking ${bookingId}. Reason: ${reason || 'Not specified'}`);

    return NextResponse.json({
      success: true,
      message: 'Booking rejected. It will be offered to other providers.',
      booking: {
        id: booking._id,
        status: booking.status
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Booking rejection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to reject booking',
        error: error.message
      },
      { status: 500 }
    );
  }
}

