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

    // ONE-TO-ONE REJECTION LOGIC:
    // Member books with a specific provider → Only that provider gets notified
    // When that provider rejects → Immediate refund and booking rejection
    // Member can then book with a different provider
    console.log(`🔴 Provider ${providerId} rejected booking ${bookingId}`);
    
    // Immediately mark booking as rejected and process refund
    booking.status = 'rejected';
    if (booking.negotiation && booking.negotiation.isActive) {
      booking.negotiation.isActive = false;
      booking.negotiation.status = 'declined';
      booking.negotiation.respondedAt = new Date();
    }
    await booking.save();

    console.log(`✅ Booking marked as rejected. Processing refund...`);

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
              description: `25% booking deposit refunded (₹${refundAmount}) - Provider rejected`,
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

    // Send push notification to member
    const homeowner = await Homeowner.findById(booking.customerId);
    if (homeowner) {
      // Create persistent notification in database
      try {
        const { createAndSendNotification } = await import('@/lib/notificationHelper');
        await createAndSendNotification({
          title: '❌ Booking Declined',
          message: `Unfortunately, the partner has declined your ${booking.serviceName} booking. Your ${booking.paymentMethod === 'wallet' ? 'wallet payment has been refunded' : 'booking has been cancelled'}. Please try booking again.`,
          recipientId: booking.customerId.toString(),
          recipientType: 'homeowner',
          pushToken: homeowner.pushToken,
          type: 'booking_rejected',
          data: {
            type: 'booking_rejected',
            bookingId: booking._id.toString()
          },
          bookingId: booking._id.toString()
        });
        console.log(`📱 Notification sent to member: ${homeowner.name}`);
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
        // Don't fail the rejection if notification fails
      }
    }

    console.log(`❌ Booking ${bookingId} rejected and refunded successfully`);

    return NextResponse.json({
      success: true,
      message: 'Booking rejected and refunded successfully.',
      booking: {
        id: booking._id,
        status: booking.status,
        refunded: booking.paymentMethod === 'wallet' && booking.paymentStatus === 'refunded'
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

