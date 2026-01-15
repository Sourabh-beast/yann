import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Transaction from '@/models/Transaction';

/**
 * GET /api/provider/withdrawal/history
 * Get provider's withdrawal history
 */
export async function GET(request) {
  try {
    await connectDB();

    // Get providerId from query params
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Get withdrawal transactions
    const skip = (page - 1) * limit;
    
    const withdrawals = await Transaction.find({
      providerId: providerId,
      type: { $in: ['withdrawal_request', 'withdrawal_completed', 'withdrawal_rejected'] }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalCount = await Transaction.countDocuments({
      providerId: providerId,
      type: { $in: ['withdrawal_request', 'withdrawal_completed', 'withdrawal_rejected'] }
    });

    // Format withdrawals
    const formattedWithdrawals = withdrawals.map(withdrawal => ({
      id: withdrawal._id,
      requestedAmount: withdrawal.withdrawalDetails?.requestedAmount || withdrawal.amount,
      processingFee: withdrawal.withdrawalDetails?.commissionAmount || 0,
      netAmount: withdrawal.withdrawalDetails?.netAmount || withdrawal.providerAmount,
      status: withdrawal.status,
      type: withdrawal.type,
      bankDetails: {
        accountNumber: withdrawal.withdrawalDetails?.bankDetails?.accountNumber ? 
          '****' + withdrawal.withdrawalDetails.bankDetails.accountNumber.slice(-4) : null,
        ifscCode: withdrawal.withdrawalDetails?.bankDetails?.ifscCode,
        bankName: withdrawal.withdrawalDetails?.bankDetails?.bankName
      },
      requestedAt: withdrawal.createdAt,
      processedAt: withdrawal.withdrawalDetails?.processedAt,
      rejectionReason: withdrawal.withdrawalDetails?.rejectionReason
    }));

    return NextResponse.json({
      success: true,
      data: {
        withdrawals: formattedWithdrawals,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching withdrawal history:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
