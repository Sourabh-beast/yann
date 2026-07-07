import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import Transaction from '@/models/Transaction';
import PlatformSettings from '@/models/PlatformSettings';

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

    // Pagination parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const skip = (page - 1) * limit;

    // Get total count for pagination meta
    const total = await Transaction.countDocuments(transactionQuery);
    const totalPages = Math.ceil(total / limit);

    // Get wallet transactions with pagination
    const transactions = await Transaction.find(transactionQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
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

    let bonusSpendCapPercent = 20;
    let maxBonusUsable = 0;
    if (userType === 'homeowner') {
      try {
        const settings = await PlatformSettings.getSettings();
        bonusSpendCapPercent = settings?.referral?.bonusSpendCapPercent ?? 20;
      } catch (settingsError) {
        console.warn('Could not load referral settings for wallet response:', settingsError.message);
      }
      const bonusGranted = user.wallet?.bonusBalanceGranted || 0;
      const bonusBalance = user.wallet?.bonusBalance || 0;
      maxBonusUsable = Math.min(bonusBalance, Math.floor(bonusGranted * (bonusSpendCapPercent / 100)));
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: user.wallet?.balance || 0,
        ...(userType === 'homeowner' && {
          bonusBalance: user.wallet?.bonusBalance || 0,
          bonusSpendCapPercent,
          // Precomputed: max bonus credit usable in a single upcoming payment
          maxBonusUsable
        }),
        currency: user.wallet?.currency || 'INR',
        transactions: processedTransactions,
        userType,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages
        }
      }
    });
  } catch (error) {
    console.error('Wallet GET error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
