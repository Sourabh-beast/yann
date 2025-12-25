import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import Booking from '@/models/Booking';
import Transaction from '@/models/Transaction';

export async function POST(req) {
  try {
    // Extract user ID from request headers (sent by mobile app)
    const userId = req.headers.get('x-user-id');
    
    console.log('📥 Wallet payment request:', { userId: userId ? `${userId.substring(0, 8)}...` : 'missing' });
    
    if (!userId) {
      console.error('❌ Missing user ID');
      return NextResponse.json({ success: false, message: 'Unauthorized - User ID required' }, { status: 401 });
    }

    const bookingData = await req.json();
    const { totalPrice } = bookingData;

    console.log('💰 Booking amount:', totalPrice);

    await connectDB();

    // Validate MongoDB ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('❌ Invalid user ID format:', userId);
      return NextResponse.json(
        { success: false, message: 'Invalid user ID - please log out and log back in' },
        { status: 400 }
      );
    }

    const user = await Homeowner.findById(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return NextResponse.json({ success: false, message: 'User not found - please log out and log back in' }, { status: 404 });
    }

    const currentBalance = user.wallet?.balance || 0;

    console.log('💳 Current wallet balance:', currentBalance);

    // Check sufficient balance
    if (currentBalance < totalPrice) {
      console.error('❌ Insufficient balance:', { required: totalPrice, available: currentBalance });
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

    console.log('✅ Wallet debited:', { before: balanceBefore, after: balanceAfter, amount: totalPrice });

    // Create booking
    const booking = await Booking.create({
      ...bookingData,
      paymentMethod: 'wallet',
      paymentStatus: 'paid'
    });

    console.log('✅ Booking created:', booking._id);

    // Log transaction
    await Transaction.create({
      bookingId: booking._id,
      customerId: userId,
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

    console.log('✅ Transaction logged');

    return NextResponse.json({
      success: true,
      booking,
      newBalance: balanceAfter
    });
  } catch (error) {
    console.error('❌ Wallet booking error:', {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Booking failed' 
    }, { status: 500 });
  }
}
