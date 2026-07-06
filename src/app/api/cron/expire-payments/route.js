import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import { createAndSendNotification } from '@/lib/notificationHelper';

/**
 * GET - Auto-cancel bookings with expired payment timers
 * This should be called by a cron job every minute
 */
export async function GET(request) {
  try {
    await connectDB();

    const now = new Date();

    // Find all bookings in pending_payment with expired payment timer
    const expiredBookings = await Booking.find({
      status: 'pending_payment',
      'paymentTimer.expiresAt': { $lt: now },
      'paymentTimer.timedOut': { $ne: true }
    }).populate('customerId', 'name email pushToken').lean();

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired payment timers found',
        cancelledCount: 0
      });
    }

    // Bulk-cancel all expired bookings in one write (was one .save() per
    // booking, sequentially). Booking has no pre-save hooks, so this is
    // equivalent. Notifications are best-effort side effects, so they're
    // fired in parallel below rather than gating/blocking the cancellation.
    const expiredIds = expiredBookings.map((b) => b._id);
    await Booking.updateMany(
      { _id: { $in: expiredIds } },
      { $set: { status: 'cancelled', 'paymentTimer.timedOut': true } }
    );

    const cancelledCount = expiredBookings.length;
    const results = expiredBookings.map((booking) => ({
      bookingId: booking._id.toString(),
      serviceName: booking.serviceName,
      status: 'cancelled',
      reason: 'payment_timeout'
    }));

    // Notify customers in parallel; each failure is caught independently and
    // does not affect the cancellation (which already happened above).
    await Promise.allSettled(
      expiredBookings
        .filter((booking) => booking.customerId?.pushToken)
        .map((booking) =>
          createAndSendNotification({
            title: '❌ Booking Cancelled',
            message: `Your ${booking.serviceName} booking was cancelled due to payment timeout.`,
            recipientId: booking.customerId._id.toString(),
            recipientType: 'homeowner',
            pushToken: booking.customerId.pushToken,
            type: 'booking_cancelled',
            data: {
              recipientId: booking.customerId._id.toString(),
              bookingId: booking._id.toString(),
              reason: 'payment_timeout'
            },
            bookingId: booking._id.toString()
          }).catch((error) => {
            console.error(`Failed to notify customer for booking ${booking._id}:`, error);
          })
        )
    );

    console.log(`✅ Expired ${cancelledCount} bookings with payment timeout`);

    return NextResponse.json({
      success: true,
      message: `Cancelled ${cancelledCount} booking(s) due to payment timeout`,
      cancelledCount,
      results
    });

  } catch (error) {
    console.error('❌ Error processing expired payments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process expired payments' },
      { status: 500 }
    );
  }
}
