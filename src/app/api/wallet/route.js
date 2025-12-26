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
      // Members see only THEIR transactions (topup, debit, refund)
      // wallet_credit is for providers only (earnings from bookings)
      transactionQuery = { 
        customerId: userId,
        type: { $in: ['wallet_topup', 'wallet_debit', 'wallet_refund'] }
      };
    } else {
      // If not found, try ServiceProvider
      user = await ServiceProvider.findById(userId).select('wallet');
      if (user) {
        userType = 'provider';
        // Providers ONLY see earnings (wallet_credit from accepted bookings)
        transactionQuery = { 
          providerId: userId,
          type: 'wallet_credit' // Only show earnings, not expenses
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
