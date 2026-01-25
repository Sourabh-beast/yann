import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import Homeowner from '@/models/Homeowner';
import { createAndSendNotification } from '@/lib/notificationHelper';
import { sendPushNotification } from '@/lib/sendPushNotification';

// Request timeout duration in milliseconds (3 minutes)
const REQUEST_TIMEOUT_MS = 3 * 60 * 1000;

/**
 * GET - Check booking request status
 * Used by customer to poll for provider response
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');
    const customerId = searchParams.get('customerId');

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId)
      .populate('assignedProvider', 'name phone profileImage')
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Security: Verify ownership
    if (customerId && booking.customerId && 
        String(booking.customerId) !== String(customerId)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Calculate remaining time
    let remainingSeconds = 0;
    let isExpired = false;

    if (booking.requestTimer?.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(booking.requestTimer.expiresAt);
      remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));
      isExpired = remainingSeconds <= 0 && booking.status === 'awaiting_response';

      // Auto-expire if timer ran out but status wasn't updated
      if (isExpired && booking.status === 'awaiting_response') {
        await Booking.findByIdAndUpdate(bookingId, {
          status: 'expired',
          'requestTimer.timedOut': true
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking._id,
        status: isExpired ? 'expired' : booking.status,
        remainingSeconds,
        isExpired,
        provider: booking.assignedProvider ? {
          id: booking.assignedProvider._id,
          name: booking.assignedProvider.name,
          profileImage: booking.assignedProvider.profileImage
        } : null,
        serviceName: booking.serviceName,
        customerName: booking.customerName,
        customerAddress: booking.customerAddress,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        totalPrice: booking.totalPrice,
        requestTimer: booking.requestTimer,
        rejectedProviderIds: booking.providerResponses
          ?.filter(r => r.response === 'rejected')
          .map(r => String(r.providerId)) || []
      }
    });

  } catch (error) {
    console.error('❌ Error checking booking status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to check booking status' },
      { status: 500 }
    );
  }
}

/**
 * POST - Send booking request to provider with timer
 * Initiates the 3-minute response window
 */
export async function POST(request) {
  try {
    await connectDB();

    const { bookingId, providerId } = await request.json();

    if (!bookingId || !providerId) {
      return NextResponse.json(
        { success: false, message: 'Booking ID and Provider ID are required' },
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

    // Verify booking is in valid state for sending/resending request
    // Allow 'pending' for initial requests and 'awaiting_response' for reassigned bookings
    if (!['pending', 'awaiting_response'].includes(booking.status)) {
      return NextResponse.json(
        { success: false, message: `Cannot send request for booking with status: ${booking.status}` },
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

    // Check if provider is available (online)
    if (provider.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Provider is currently offline' },
        { status: 400 }
      );
    }

    // Set timer
    const now = new Date();
    const expiresAt = new Date(now.getTime() + REQUEST_TIMEOUT_MS);

    // Update booking with timer and provider assignment
    booking.status = 'awaiting_response';
    booking.assignedProvider = providerId;
    booking.providerName = provider.name;
    booking.requestTimer = {
      sentAt: now,
      expiresAt: expiresAt,
      respondedAt: null,
      timedOut: false,
      lastBuzzerAt: now,
      buzzerCount: 1
    };

    await booking.save();

    // Send push notification to provider (with buzzer sound)
    if (provider.pushToken) {
      await sendPushNotification(
        provider.pushToken,
        '🔔 New Booking Request!',
        `${booking.customerName} needs ${booking.serviceName}. Respond within 3 minutes!`,
        {
          type: 'booking_request',
          recipientId: providerId, // CRITICAL: Filter notification by assigned provider only
          bookingId: booking._id.toString(),
          serviceName: booking.serviceName,
          customerName: booking.customerName,
          totalPrice: booking.totalPrice,
          expiresAt: expiresAt.toISOString(),
          sound: 'buzzer', // Custom sound identifier
          priority: 'high',
          channelId: 'booking_requests', // Android notification channel
          vibrate: [0, 500, 200, 500, 200, 500] // Continuous vibration pattern
        }
      );

      // Also create persistent notification record
      await createAndSendNotification({
        title: '🔔 New Booking Request!',
        message: `${booking.customerName} needs ${booking.serviceName}. Respond within 3 minutes!`,
        recipientId: providerId,
        recipientType: 'provider',
        pushToken: null, // Already sent above with custom sound
        type: 'booking_request',
        data: {
          recipientId: providerId, // Ensure frontend filters correctly
          bookingId: booking._id.toString(),
          expiresAt: expiresAt.toISOString()
        },
        bookingId: booking._id.toString()
      });
    }

    console.log(`✅ Booking request sent to provider ${provider.name}, expires at ${expiresAt}`);

    return NextResponse.json({
      success: true,
      message: 'Booking request sent to provider',
      data: {
        bookingId: booking._id,
        status: 'awaiting_response',
        expiresAt: expiresAt.toISOString(),
        remainingSeconds: Math.floor(REQUEST_TIMEOUT_MS / 1000),
        provider: {
          id: provider._id,
          name: provider.name,
          profileImage: provider.profileImage
        }
      }
    });

  } catch (error) {
    console.error('❌ Error sending booking request:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send booking request' },
      { status: 500 }
    );
  }
}
