import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Transaction from '@/models/Transaction';

/**
 * GET /api/provider/withdrawal/balance
 * Get provider's available withdrawal balance
 */
export async function GET(request) {
  try {
    await connectDB();

    // Get providerId from query params
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Calculate total earnings (completed transactions)
    const completedTransactions = await Transaction.find({
      providerId: providerId,
      type: { $in: ['escrow_release', 'completion_payment'] },
      status: 'completed'
    });

    const totalEarnings = completedTransactions.reduce((sum, txn) => sum + (txn.providerAmount || 0), 0);

    // Calculate already withdrawn amount
    const withdrawalTransactions = await Transaction.find({
      providerId: providerId,
      type: { $in: ['withdrawal_completed', 'withdrawal_request'] },
      status: { $in: ['completed', 'pending'] }
    });

    const totalWithdrawn = withdrawalTransactions.reduce((sum, txn) => sum + (txn.withdrawalDetails?.requestedAmount || 0), 0);

    // Calculate pending withdrawals
    const pendingWithdrawals = withdrawalTransactions.filter(txn => txn.status === 'pending');
    const pendingAmount = pendingWithdrawals.reduce((sum, txn) => sum + (txn.withdrawalDetails?.requestedAmount || 0), 0);

    // Available balance
    const availableBalance = totalEarnings - totalWithdrawn;

    return NextResponse.json({
      success: true,
      data: {
        totalEarnings: totalEarnings.toFixed(2),
        totalWithdrawn: totalWithdrawn.toFixed(2),
        pendingWithdrawals: pendingAmount.toFixed(2),
        availableBalance: availableBalance.toFixed(2),
        minimumWithdrawal: 1,
        processingFeePercentage: 2
      }
    });

  } catch (error) {
    console.error('Error fetching withdrawal balance:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
