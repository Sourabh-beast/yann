import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';
import Transaction from '@/models/Transaction';
import { createAndSendNotification } from '@/lib/notificationHelper';

/**
 * POST /api/provider/withdrawal/request
 * Request withdrawal of earnings
 */
export async function POST(request) {
  try {
    await connectDB();

    const { providerId, amount, bankDetails } = await request.json();

    // Validate input
    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Valid withdrawal amount is required' },
        { status: 400 }
      );
    }

    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName) {
      return NextResponse.json(
        { success: false, message: 'Complete bank details are required (Account Number, IFSC Code, Bank Name)' },
        { status: 400 }
      );
    }

    // Find the provider
    const provider = await ServiceProvider.findById(providerId);

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
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

    // Available balance
    const availableBalance = totalEarnings - totalWithdrawn;

    // Validate withdrawal amount
    if (amount > availableBalance) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Insufficient balance. Available: ₹${availableBalance.toFixed(2)}`,
          data: {
            totalEarnings: totalEarnings.toFixed(2),
            totalWithdrawn: totalWithdrawn.toFixed(2),
            availableBalance: availableBalance.toFixed(2)
          }
        },
        { status: 400 }
      );
    }

    // Minimum withdrawal amount check
    const minimumWithdrawal = 1;
    if (amount < minimumWithdrawal) {
      return NextResponse.json(
        { success: false, message: `Minimum withdrawal amount is ₹${minimumWithdrawal}` },
        { status: 400 }
      );
    }

    // Calculate commission (e.g., 2% processing fee on withdrawal)
    const commissionRate = 0.02; // 2%
    const commissionAmount = amount * commissionRate;
    const netAmount = amount - commissionAmount;

    // Create withdrawal transaction
    const withdrawalTransaction = await Transaction.create({
      providerId: providerId,
      type: 'withdrawal_request',
      amount: amount,
      commissionAmount: commissionAmount,
      commissionPercentage: commissionRate * 100,
      providerAmount: netAmount,
      paymentMethod: 'bank_transfer',
      status: 'pending',
      withdrawalDetails: {
        requestedAmount: amount,
        commissionRate: commissionRate,
        commissionAmount: commissionAmount,
        netAmount: netAmount,
        bankDetails: {
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
          bankName: bankDetails.bankName
        }
      }
    });

    // Send notification to provider
    await createAndSendNotification(
      'general',
      null,
      null,
      providerId,
      {
        title: 'Withdrawal Request Received',
        body: `Your withdrawal request for ₹${amount} is being processed`,
        amount: amount,
        netAmount: netAmount,
        transactionId: withdrawalTransaction._id
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully. It will be processed within 3-5 business days.',
      data: {
        transactionId: withdrawalTransaction._id,
        requestedAmount: amount,
        processingFee: commissionAmount.toFixed(2),
        netAmount: netAmount.toFixed(2),
        bankDetails: {
          accountNumber: '****' + bankDetails.accountNumber.slice(-4),
          ifscCode: bankDetails.ifscCode,
          bankName: bankDetails.bankName
        },
        availableBalance: (availableBalance - amount).toFixed(2)
      }
    });

  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to process withdrawal request' },
      { status: 500 }
    );
  }
}
