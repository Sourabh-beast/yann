import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Transaction from '@/models/Transaction';
import { createAndSendNotification } from '@/lib/notificationHelper';

/**
 * POST /api/admin/withdrawals/process
 * Process (approve/reject) a withdrawal request
 */
export async function POST(request) {
  try {
    await connectDB();

    const { transactionId, action, rejectionReason, paymentReferenceId } = await request.json();

    // Validate input
    if (!transactionId) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Find the transaction
    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.type !== 'withdrawal_request') {
      return NextResponse.json(
        { success: false, message: 'This is not a withdrawal request' },
        { status: 400 }
      );
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'This withdrawal has already been processed' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // Approve withdrawal
      transaction.type = 'withdrawal_completed';
      transaction.status = 'completed';
      transaction.withdrawalDetails.processedAt = new Date();
      
      if (paymentReferenceId) {
        transaction.razorpayPaymentId = paymentReferenceId;
      }

      await transaction.save();

      // Send success notification
      await createAndSendNotification(
        'general',
        null,
        null,
        transaction.providerId,
        {
          title: 'Withdrawal Completed! 💰',
          body: `₹${transaction.withdrawalDetails.netAmount.toFixed(2)} has been transferred to your bank account`,
          amount: transaction.withdrawalDetails.requestedAmount,
          netAmount: transaction.withdrawalDetails.netAmount,
          transactionId: transaction._id
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Withdrawal approved and processed successfully',
        data: {
          transactionId: transaction._id,
          amount: transaction.withdrawalDetails.requestedAmount,
          netAmount: transaction.withdrawalDetails.netAmount,
          processedAt: transaction.withdrawalDetails.processedAt
        }
      });

    } else {
      // Reject withdrawal
      transaction.type = 'withdrawal_rejected';
      transaction.status = 'failed';
      transaction.withdrawalDetails.processedAt = new Date();
      transaction.withdrawalDetails.rejectionReason = rejectionReason || 'Not specified';

      await transaction.save();

      // Send rejection notification
      await createAndSendNotification(
        'general',
        null,
        null,
        transaction.providerId,
        {
          title: 'Withdrawal Request Declined',
          body: rejectionReason || 'Your withdrawal request was declined. Please contact support.',
          amount: transaction.withdrawalDetails.requestedAmount,
          rejectionReason: rejectionReason,
          transactionId: transaction._id
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Withdrawal rejected',
        data: {
          transactionId: transaction._id,
          amount: transaction.withdrawalDetails.requestedAmount,
          rejectionReason: rejectionReason || 'Not specified'
        }
      });
    }

  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}
