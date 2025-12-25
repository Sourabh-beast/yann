import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Homeowner from '@/models/Homeowner';
import Booking from '@/models/Booking';
import Transaction from '@/models/Transaction';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const bookingData = await req.json();
    const { totalPrice } = bookingData;

    await dbConnect();

    const user = await Homeowner.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const currentBalance = user.wallet?.balance || 0;

    // Check sufficient balance
    if (currentBalance < totalPrice) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient wallet balance',
        required: totalPrice,
        available: currentBalance
      }, { status: 400 });
    }

    // Deduct from wallet
    const balanceBefore = currentBalance;
    const balanceAfter = currentBalance - totalPrice;

    user.wallet.balance = balanceAfter;
    await user.save();

    // Create booking
    const booking = await Booking.create({
      ...bookingData,
      paymentMethod: 'wallet',
      paymentStatus: 'paid'
    });

    // Log transaction
    await Transaction.create({
      bookingId: booking._id,
      customerId: session.user.id,
      providerId: bookingData.providerId,
      type: 'wallet_debit',
      amount: totalPrice,
      balanceBefore,
      balanceAfter,
      description: `Payment for booking #${booking._id}`,
      status: 'completed',
      paymentMethod: 'wallet',
      currency: 'INR',
      serviceName: bookingData.serviceName,
      serviceCategory: bookingData.serviceCategory
    });

    return NextResponse.json({
      success: true,
      booking,
      newBalance: balanceAfter
    });
  } catch (error) {
    console.error('Wallet booking error:', error);
    return NextResponse.json({ success: false, message: 'Booking failed' }, { status: 500 });
  }
}
