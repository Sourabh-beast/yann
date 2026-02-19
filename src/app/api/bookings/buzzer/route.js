import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import Homeowner from '@/models/Homeowner';
import { sendPushNotification } from '@/lib/sendPushNotification';
import { createAndSendNotification } from '@/lib/notificationHelper';

// Buzzer interval in seconds.
// The booking_request.wav sound is ~23 s long.  Sending a new notification
// every 20 s means the next ping arrives ~3 s before the previous sound ends,
// producing near-seamless ringing on the partner's device while the app is
// in the background (system notification channel sound plays on every push).
const BUZZER_INTERVAL_SECONDS = 20;

/**
 * POST - Send continuous buzzer notification to provider
 * Called periodically while awaiting response
 */
export async function POST(request) {
  try {
    await connectDB();

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
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

    // Only send buzzer if booking is still awaiting response
    if (booking.status !== 'awaiting_response') {
      return NextResponse.json({
        success: true,
        message: 'Booking is no longer awaiting response',
        data: {
          status: booking.status,
          shouldContinueBuzzer: false
        }
      });
    }

    // Check if request has expired
    const now = new Date();
    if (booking.requestTimer?.expiresAt && new Date(booking.requestTimer.expiresAt) < now) {
      // Mark as expired and notify customer
      booking.status = 'expired';
      booking.requestTimer.timedOut = true;
      await booking.save();

      // Refund wallet payment if applicable
      if (booking.paymentMethod === 'wallet' && booking.walletPaymentStage === 'initial_25_held') {
        const customer = await Homeowner.findById(booking.customerId);
        if (customer) {
          if (!customer.wallet) {
            customer.wallet = { balance: 0, currency: 'INR' };
          }
          const refundAmount = booking.escrowDetails?.initialAmount || booking.totalPrice * 0.25;
          customer.wallet.balance = (customer.wallet.balance || 0) + refundAmount;
          await customer.save();

          booking.walletPaymentStage = 'none';
          booking.escrowDetails.initialRefundedAt = now;
          booking.paymentStatus = 'refunded';
          await booking.save();
        }
      }

      // Notify customer about timeout
      const customer = await Homeowner.findById(booking.customerId);
      const provider = await ServiceProvider.findById(booking.assignedProvider);

      if (customer?.pushToken) {
        await createAndSendNotification({
          title: '⏰ Request Timed Out',
          message: `${provider?.name || 'The provider'} didn't respond in time for your ${booking.serviceName} booking. Please try another provider.`,
          recipientId: customer._id.toString(),
          recipientType: 'homeowner',
          pushToken: customer.pushToken,
          type: 'booking_expired',
          data: {
            bookingId: booking._id.toString(),
            screen: 'SelectProvider',
            serviceId: booking.serviceId,
            serviceName: booking.serviceName
          },
          bookingId: booking._id.toString()
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Request expired',
        data: {
          status: 'expired',
          shouldContinueBuzzer: false,
          refundProcessed: booking.paymentMethod === 'wallet'
        }
      });
    }

    // Check if enough time has passed since last buzzer
    const lastBuzzer = booking.requestTimer?.lastBuzzerAt;
    const timeSinceLastBuzzer = lastBuzzer 
      ? (now - new Date(lastBuzzer)) / 1000 
      : BUZZER_INTERVAL_SECONDS + 1;

    if (timeSinceLastBuzzer < BUZZER_INTERVAL_SECONDS) {
      return NextResponse.json({
        success: true,
        message: 'Buzzer cooldown active',
        data: {
          status: 'awaiting_response',
          shouldContinueBuzzer: true,
          nextBuzzerIn: Math.ceil(BUZZER_INTERVAL_SECONDS - timeSinceLastBuzzer)
        }
      });
    }

    // Find provider
    const provider = await ServiceProvider.findById(booking.assignedProvider);
    if (!provider?.pushToken) {
      return NextResponse.json({
        success: true,
        message: 'Provider has no push token',
        data: {
          status: 'awaiting_response',
          shouldContinueBuzzer: true
        }
      });
    }

    // Calculate remaining time
    const remainingSeconds = Math.max(0, 
      Math.floor((new Date(booking.requestTimer.expiresAt) - now) / 1000)
    );

    // Send buzzer notification
    const buzzerCount = (booking.requestTimer?.buzzerCount || 0) + 1;
    const urgencyEmoji = remainingSeconds <= 60 ? '🚨' : remainingSeconds <= 120 ? '⚡' : '🔔';

    await sendPushNotification(
      provider.pushToken,
      `${urgencyEmoji} Booking Request - ${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, '0')} left!`,
      `${booking.customerName} is waiting for ${booking.serviceName}. Tap to respond now!`,
      {
        type: 'booking_request_reminder',
        bookingId: booking._id.toString(),
        serviceName: booking.serviceName,
        customerName: booking.customerName,
        customerAddress: booking.customerAddress || '',
        customerPhone: booking.customerPhone || '',
        customerProfileImage: booking.customerProfileImage || '',
        bookingDate: booking.bookingDate || '',
        bookingTime: booking.bookingTime || '',
        notes: booking.notes || '',
        totalPrice: booking.totalPrice,
        // expiresAt is required by the app to compute the remaining timer on the modal
        expiresAt: new Date(booking.requestTimer.expiresAt).toISOString(),
        recipientId: booking.assignedProvider.toString(),
        remainingSeconds,
        buzzerCount,
        priority: 'high',
        // Always use the stable 'booking_requests' channel ID.
        // The app deletes and recreates this channel on every startup so the
        // correct sound is always applied — no version bumping ever needed.
        channelId: 'booking_requests',
        vibrate: [0, 1000, 500, 1000, 500, 1000]
      }
    );

    // Update buzzer tracking
    booking.requestTimer.lastBuzzerAt = now;
    booking.requestTimer.buzzerCount = buzzerCount;
    await booking.save();

    console.log(`🔔 Buzzer #${buzzerCount} sent to provider ${provider.name}, ${remainingSeconds}s remaining`);

    return NextResponse.json({
      success: true,
      message: 'Buzzer sent',
      data: {
        status: 'awaiting_response',
        shouldContinueBuzzer: true,
        buzzerCount,
        remainingSeconds
      }
    });

  } catch (error) {
    console.error('❌ Error sending buzzer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send buzzer' },
      { status: 500 }
    );
  }
}
