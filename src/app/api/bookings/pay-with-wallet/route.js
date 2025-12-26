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
    const { totalPrice, bookingDate } = bookingData;

    console.log('💰 Booking amount:', totalPrice);
    console.log('📅 Booking date:', bookingDate);

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

    // Deduct from wallet (ESCROW: money held by platform until provider accepts/rejects)
    const balanceBefore = currentBalance;
    const balanceAfter = currentBalance - totalPrice;

    user.wallet.balance = balanceAfter;
    await user.save();

    console.log('✅ Wallet debited (held in escrow):', { before: balanceBefore, after: balanceAfter, amount: totalPrice });

    let booking;
    try {
      // Convert bookingDate string to Date object if needed
      const parsedBookingDate = typeof bookingDate === 'string' ? new Date(bookingDate) : bookingDate;

      // Create booking with escrow payment status
      booking = await Booking.create({
        ...bookingData,
        bookingDate: parsedBookingDate,
        paymentMethod: 'wallet',
        paymentStatus: 'paid', // Money is paid and held in escrow
        customerId: userId
      });

      console.log('✅ Booking created:', booking._id);

      // Log transaction (money held in escrow)
      await Transaction.create({
        bookingId: booking._id,
        customerId: userId,
        providerId: bookingData.providerId || null,
        type: 'wallet_debit',
        amount: totalPrice,
        balanceBefore,
        balanceAfter,
        description: `Payment for booking #${booking._id} (held in escrow)`,
        status: 'completed',
        paymentMethod: 'wallet',
        currency: 'INR',
        serviceName: bookingData.serviceName,
        serviceCategory: bookingData.serviceCategory
      });

      console.log('✅ Transaction logged (escrow)');
      console.log('💡 Money will be transferred to provider when booking is accepted');
      console.log('💡 Money will be refunded to customer if booking is rejected');
    } catch (bookingError) {
      // CRITICAL: Rollback wallet deduction if booking creation fails
      console.error('❌ Booking creation failed, rolling back wallet deduction:', bookingError.message);
      console.error('Error details:', bookingError);
      
      user.wallet.balance = balanceBefore;
      await user.save();
      
      console.log('✅ Wallet balance restored:', balanceBefore);
      
      throw new Error(`Booking creation failed: ${bookingError.message}`);
    }

    return NextResponse.json({
      success: true,
      booking,
      newBalance: balanceAfter,
      message: 'Payment successful. Money held in escrow until provider accepts.'
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
