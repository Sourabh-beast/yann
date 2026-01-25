import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import Transaction from '@/models/Transaction';

export async function GET(req) {
  try {
    // Extract user ID from request headers (sent by mobile app)
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let user;
    let transactionQuery;
    let userType;

    // Try to find user as Homeowner first
    user = await Homeowner.findById(userId).select('wallet');
    if (user) {
      userType = 'homeowner';
      // Members see their transactions (topup, debit, refund, escrow)
      transactionQuery = {
        customerId: userId,
        type: {
          $in: [
            'wallet_topup',
            'wallet_debit',
            'wallet_refund',
            'booking_initial_payment', // 25% initial payment
            'booking_completion_payment', // 75% completion payment
            'escrow_hold',      // 25% held for booking
            'escrow_refund',    // 25% refunded when rejected
            'completion_payment' // 75% paid after completion
          ]
        }
      };
    } else {
      // If not found, try ServiceProvider
      user = await ServiceProvider.findById(userId).select('wallet');
      if (user) {
        userType = 'provider';
        // Providers see earnings and withdrawal transactions
        transactionQuery = {
          providerId: userId,
          type: {
            $in: [
              'booking_initial_payment', // 25% initial payment (held in escrow)
              'booking_completion_payment', // 75% completion payment
              'wallet_credit',        // Earnings from bookings
              'escrow_release',       // 25% received on acceptance
              'withdrawal_request',   // Withdrawal requested
              'withdrawal_completed', // Withdrawal processed
              'withdrawal_rejected'   // Withdrawal rejected
            ]
          }
        };
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Get recent wallet transactions (last 50)
    const transactions = await Transaction.find(transactionQuery)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        balance: user.wallet?.balance || 0,
        currency: user.wallet?.currency || 'INR',
        transactions,
        userType
      }
    });
  } catch (error) {
    console.error('Wallet GET error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
