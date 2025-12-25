import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import Homeowner from '@/models/Homeowner';
import Transaction from '@/models/Transaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, reason } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ success: false, message: 'Booking ID required' }, { status: 400 });
    }

    await dbConnect();

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    // Verify ownership
    if (booking.customerId.toString() !== session.user.id) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json({ success: false, message: 'Already cancelled' }, { status: 400 });
    }

    // Get user for wallet refund
    const user = await Homeowner.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Determine refund amount (currently 100%, can be modified for partial refunds)
    const refundAmount = booking.totalPrice || 0;

    // Credit to wallet (regardless of original payment method)
    const balanceBefore = user.wallet?.balance || 0;
    const balanceAfter = balanceBefore + refundAmount;

    user.wallet = {
      balance: balanceAfter,
      currency: 'INR'
    };
    await user.save();

    // Log refund transaction
    await Transaction.create({
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
    });

    // Update booking status
    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellationReason = reason || 'Cancelled by customer';
    booking.cancelledAt = new Date();
    await booking.save();

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
