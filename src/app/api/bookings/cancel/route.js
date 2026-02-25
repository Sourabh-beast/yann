import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import { sendPushNotification } from '@/lib/sendPushNotification';

export async function POST(req) {
  try {
    // Extract user ID from request headers (sent by mobile app)
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, reason } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ success: false, message: 'Booking ID required' }, { status: 400 });
    }

    await connectDB();

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    // Verify ownership
    if (booking.customerId.toString() !== userId) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json({ success: false, message: 'Already cancelled' }, { status: 400 });
    }

    // No refund issued — just cancel the booking regardless of payment state
    booking.status = 'cancelled';
    booking.cancellationReason = reason || 'Cancelled by customer';
    booking.cancelledAt = new Date();
    await booking.save();

    // Notify the assigned provider that the booking was cancelled
    if (booking.assignedProvider) {
      try {
        const provider = await ServiceProvider.findById(booking.assignedProvider).select('pushToken name');
        if (provider?.pushToken) {
          await sendPushNotification(
            provider.pushToken,
            '❌ Booking Cancelled',
            `${booking.customerName || 'Customer'} cancelled their ${booking.serviceName || 'booking'} request.`,
            {
              type: 'booking_cancelled',
              bookingId: booking._id.toString(),
              recipientId: provider._id.toString(),
              channelId: 'default',
            }
          );
          console.log(`📲 Cancellation push sent to provider ${provider.name}`);
        }
      } catch (pushError) {
        console.error('⚠️ Failed to notify provider of cancellation:', pushError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully.',
    });

  } catch (error) {
    console.error('Booking cancellation error:', error);
    return NextResponse.json({ success: false, message: 'Cancellation failed' }, { status: 500 });
  }
}
