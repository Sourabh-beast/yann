import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import Transaction from '@/models/Transaction';
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

    // Get user for wallet refund
    const user = await Homeowner.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Determine refund amount (currently 100%, can be modified for partial refunds)
    const refundAmount = booking.totalPrice || 0;

    // Use MongoDB transaction for atomic refund and booking update
    const session = await Homeowner.startSession();
    session.startTransaction();

    try {
      // Credit to wallet (regardless of original payment method)
      const balanceBefore = user.wallet?.balance || 0;
      const balanceAfter = balanceBefore + refundAmount;

      user.wallet = {
        balance: balanceAfter,
        currency: 'INR'
      };
      await user.save({ session });

      // Log refund transaction
      await Transaction.create([{
        bookingId: booking._id,
        customerId: booking.customerId,
        providerId: booking.providerId,
        type: 'wallet_refund',
        amount: refundAmount,
        balanceBefore,
        balanceAfter,
        description: `Refund for cancelled booking #${booking._id}`,
        status: 'completed',
        paymentMethod: booking.paymentMethod,
        currency: 'INR',
        serviceName: booking.serviceName,
        serviceCategory: booking.serviceCategory,
        notes: reason || 'Customer cancellation'
      }], { session });

      // Update booking status
      booking.status = 'cancelled';
      booking.paymentStatus = 'refunded';
      booking.cancellationReason = reason || 'Cancelled by customer';
      booking.cancelledAt = new Date();
      await booking.save({ session });

      // Commit transaction
      await session.commitTransaction();
    } catch (error) {
      // Rollback on error
      await session.abortTransaction();
      console.error('Cancellation transaction failed:', error);
      throw error;
    } finally {
      session.endSession();
    }

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
        // Don't fail the cancellation if push fails
        console.error('⚠️ Failed to notify provider of cancellation:', pushError.message);
      }
    }

    const balanceAfter = user.wallet.balance;

    return NextResponse.json({
      success: true,
      message: `Booking cancelled. ₹${refundAmount} refunded to wallet.`,
      newBalance: balanceAfter,
      refundAmount
    });

  } catch (error) {
    console.error('Booking cancellation error:', error);
    return NextResponse.json({ success: false, message: 'Cancellation failed' }, { status: 500 });
  }
}
