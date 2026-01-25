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
    }).populate('customerId', 'name email pushToken');

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired payment timers found',
        cancelledCount: 0
      });
    }

    let cancelledCount = 0;
    const results = [];

    for (const booking of expiredBookings) {
      try {
        // Mark booking as cancelled
        booking.status = 'cancelled';
        booking.paymentTimer.timedOut = true;
        await booking.save();

        cancelledCount++;

        // Notify customer
        if (booking.customerId?.pushToken) {
          await createAndSendNotification({
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
          });
        }

        results.push({
          bookingId: booking._id.toString(),
          serviceName: booking.serviceName,
          status: 'cancelled',
          reason: 'payment_timeout'
        });

        console.log(`⏰ Auto-cancelled booking ${booking._id} - payment timeout`);
      } catch (error) {
        console.error(`Failed to cancel booking ${booking._id}:`, error);
        results.push({
          bookingId: booking._id.toString(),
          status: 'failed',
          error: error.message
        });
      }
    }

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
