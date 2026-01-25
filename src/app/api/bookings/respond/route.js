import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import Homeowner from '@/models/Homeowner';
import Transaction from '@/models/Transaction';
import { createAndSendNotification } from '@/lib/notificationHelper';

/**
 * POST - Provider responds to booking request (accept/reject)
 * Handles the response within the 3-minute window
 */
export async function POST(request) {
  try {
    await connectDB();

    const { bookingId, providerId, action, reason } = await request.json();

    if (!bookingId || !providerId || !action) {
      return NextResponse.json(
        { success: false, message: 'Booking ID, Provider ID, and action are required' },
        { status: 400 }
      );
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      );
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify this is the assigned provider
    if (String(booking.assignedProvider) !== String(providerId)) {
      return NextResponse.json(
        { success: false, message: 'You are not assigned to this booking' },
        { status: 403 }
      );
    }

    // Check if booking is still in awaiting_response state
    if (booking.status !== 'awaiting_response') {
      return NextResponse.json(
        { success: false, message: `Booking is already ${booking.status}` },
        { status: 400 }
      );
    }

    // Check if request has expired
    const now = new Date();
    if (booking.requestTimer?.expiresAt && new Date(booking.requestTimer.expiresAt) < now) {
      // Mark as expired
      booking.status = 'expired';
      booking.requestTimer.timedOut = true;
      booking.requestTimer.respondedAt = now;
      await booking.save();

      return NextResponse.json(
        { success: false, message: 'Request has expired' },
        { status: 400 }
      );
    }

    // Find provider
    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Find customer for notifications
    const customer = await Homeowner.findById(booking.customerId);

    if (action === 'accept') {
      // ACCEPT FLOW - Staged payment with 3-minute timer
      // Set status to 'pending_payment' to wait for customer's 25% initial payment
      booking.status = 'pending_payment';
      booking.requestTimer.respondedAt = now;

      // Set 3-minute payment timer
      const paymentExpiresAt = new Date(now.getTime() + 3 * 60 * 1000); // 3 minutes
      booking.paymentTimer = {
        sentAt: now,
        expiresAt: paymentExpiresAt,
        paidAt: null,
        timedOut: false
      };

      // Add to provider responses
      booking.providerResponses.push({
        providerId: providerId,
        response: 'accepted',
        respondedAt: now
      });

      await booking.save();

      // Calculate 25% initial payment amount
      const initialPaymentAmount = Math.round(booking.totalPrice * 0.25);

      // Notify customer to pay 25% initial payment with BUZZER
      if (customer?.pushToken) {
        await createAndSendNotification({
          title: '🎉 Booking Accepted!',
          message: `${provider.name} accepted! Pay ₹${initialPaymentAmount} within 3 minutes to confirm.`,
          recipientId: customer._id.toString(),
          recipientType: 'homeowner',
          pushToken: customer.pushToken,
          type: 'payment_required',
          data: {
            recipientId: customer._id.toString(),
            type: 'payment_required',
            bookingId: booking._id.toString(),
            providerName: provider.name,
            providerId: provider._id.toString(),
            serviceName: booking.serviceName,
            requiresPayment: true,
            initialPaymentAmount: initialPaymentAmount,
            totalPrice: booking.totalPrice,
            expiresAt: paymentExpiresAt.toISOString(),
            sound: 'default',
            priority: 'high'
          },
          bookingId: booking._id.toString()
        });
      }

      console.log(`✅ Provider ${provider.name} accepted booking ${bookingId}, payment timer set (3 min)`);

      return NextResponse.json({
        success: true,
        message: 'Booking accepted successfully. Customer has 3 minutes to complete payment.',
        data: {
          bookingId: booking._id,
          status: 'pending_payment',
          provider: {
            id: provider._id,
            name: provider.name
          },
          requiresPayment: true,
          initialPaymentAmount: initialPaymentAmount,
          paymentExpiresAt: paymentExpiresAt.toISOString(),
          remainingSeconds: 180
        }
      });

    } else {
      // REJECT FLOW
      booking.status = 'rejected';
      booking.requestTimer.respondedAt = now;

      // Add to provider responses
      booking.providerResponses.push({
        providerId: providerId,
        response: 'rejected',
        respondedAt: now,
        rejectionReason: reason || 'Provider declined'
      });

      await booking.save();

      // Handle wallet refund
      if (booking.paymentMethod === 'wallet' && booking.walletPaymentStage === 'initial_25_held') {
        if (customer) {
          if (!customer.wallet) {
            customer.wallet = { balance: 0, currency: 'INR' };
          }

          const refundAmount = booking.escrowDetails?.initialAmount || booking.totalPrice * 0.25;
          const balanceBefore = customer.wallet.balance || 0;
          customer.wallet.balance = balanceBefore + refundAmount;
          await customer.save();

          booking.walletPaymentStage = 'none';
          booking.escrowDetails.initialRefundedAt = now;
          booking.paymentStatus = 'refunded';
          await booking.save();

          // Create refund transaction
          await Transaction.create({
            bookingId: bookingId,
            customerId: customer._id,
            type: 'escrow_refund',
            amount: refundAmount,
            balanceBefore: balanceBefore,
            balanceAfter: customer.wallet.balance,
            description: `25% booking deposit refunded - Provider declined`,
            status: 'completed',
            paymentMethod: 'wallet',
            currency: 'INR',
            serviceName: booking.serviceName
          });
        }
      }

      // Notify customer about rejection
      if (customer?.pushToken) {
        await createAndSendNotification({
          title: '😔 Provider Unavailable',
          message: `${provider.name} is unable to take your ${booking.serviceName} booking right now. Please select another provider.`,
          recipientId: customer._id.toString(),
          recipientType: 'homeowner',
          pushToken: customer.pushToken,
          type: 'booking_rejected',
          data: {
            bookingId: booking._id.toString(),
            providerName: provider.name,
            screen: 'SelectProvider',
            serviceId: booking.serviceId,
            serviceName: booking.serviceName
          },
          bookingId: booking._id.toString()
        });
      }

      console.log(`❌ Provider ${provider.name} rejected booking ${bookingId}`);

      return NextResponse.json({
        success: true,
        message: 'Booking rejected',
        data: {
          bookingId: booking._id,
          status: 'rejected',
          refundProcessed: booking.paymentMethod === 'wallet'
        }
      });
    }

  } catch (error) {
    console.error('❌ Error processing provider response:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process response' },
      { status: 500 }
    );
  }
}
