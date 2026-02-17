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
      // Members see all their transactions (where they are the customer)
      transactionQuery = {
        customerId: userId
      };
    } else {
      // If not found, try ServiceProvider
      user = await ServiceProvider.findById(userId).select('wallet');
      if (user) {
        userType = 'provider';
        // Providers see all their transactions (where they are the provider)
        transactionQuery = {
          providerId: userId
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



    // Post-process transactions to ensure correct signs (debit/credit)
    const processedTransactions = transactions.map(t => {
      let amount = t.amount;
      const type = t.type;

      // Default: positive
      let isDebit = false;

      if (userType === 'homeowner') {
        // Customer Logic
        // Debits: payment, wallet_debit, escrow_hold, booking_initial_payment, completion_payment
        const debitTypes = [
          'payment',
          'wallet_debit',
          'escrow_hold',
          'booking_initial_payment',
          'completion_payment',
          'withdrawal_request' // If applicable
        ];

        if (debitTypes.includes(type)) {
          isDebit = true;
        }
      } else if (userType === 'provider') {
        // Provider Logic
        // Debits: wallet_debit, withdrawal_completed, commission (if tracked here)
        const debitTypes = [
          'wallet_debit',
          'withdrawal_completed',
          'commission',
          'escrow_refund' // If provider has to refund
        ];

        if (debitTypes.includes(type)) {
          isDebit = true;
        }
      }

      // Apply sign
      if (isDebit) {
        amount = -Math.abs(amount);
      } else {
        amount = Math.abs(amount);
      }

      return {
        ...t,
        amount
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        balance: user.wallet?.balance || 0,
        currency: user.wallet?.currency || 'INR',
        transactions: processedTransactions,
        userType
      }
    });
  } catch (error) {
    console.error('Wallet GET error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
