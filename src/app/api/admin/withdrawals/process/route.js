import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Transaction from '@/models/Transaction';
import ServiceProvider from '@/models/ServiceProvider';
import AdminWallet from '@/models/AdminWallet';
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
      // Get provider to deduct balance
      const provider = await ServiceProvider.findById(transaction.providerId);
      if (!provider) {
        return NextResponse.json(
          { success: false, message: 'Provider not found' },
          { status: 404 }
        );
      }

      // Check if provider has sufficient balance
      const currentBalance = provider.wallet?.balance || 0;
      if (currentBalance < transaction.amount) {
        return NextResponse.json(
          { success: false, message: `Insufficient balance. Provider has ₹${currentBalance}, requested ₹${transaction.amount}` },
          { status: 400 }
        );
      }

      // Start MongoDB transaction
      const session = await ServiceProvider.startSession();
      session.startTransaction();

      try {
        // Deduct amount from provider wallet
        provider.wallet.balance = currentBalance - transaction.amount;
        await provider.save({ session });

        // Update transaction to approved
        transaction.type = 'withdrawal_completed';
        transaction.status = 'completed';
        transaction.balanceAfter = provider.wallet.balance;
        transaction.withdrawalDetails.processedAt = new Date();
        
        if (paymentReferenceId) {
          transaction.razorpayPaymentId = paymentReferenceId;
        }

        await transaction.save({ session });

        // Credit commission to admin wallet
        await AdminWallet.addCommission(
          transaction.commissionAmount,
          `Commission from ${provider.name}'s withdrawal`
        );

        // Track total volume
        await AdminWallet.trackVolume(transaction.amount);

        // Create commission transaction for admin tracking
        await Transaction.create([{
          providerId: provider._id,
          type: 'commission',
          amount: transaction.commissionAmount,
          description: `Platform commission (${transaction.commissionPercentage}%) on ₹${transaction.amount} withdrawal`,
          status: 'completed',
          currency: 'INR'
        }], { session });

        await session.commitTransaction();

        // Send success notification with transaction ID
        await createAndSendNotification(
          'general',
          null,
          null,
          transaction.providerId,
          {
            title: 'Withdrawal Approved! 💰',
            body: paymentReferenceId 
              ? `₹${transaction.withdrawalDetails.netAmount.toFixed(2)} has been approved and transferred. Transaction ID: ${paymentReferenceId}`
              : `₹${transaction.withdrawalDetails.netAmount.toFixed(2)} has been approved and will be transferred to your bank account`,
            amount: transaction.withdrawalDetails.requestedAmount,
            netAmount: transaction.withdrawalDetails.netAmount,
            transactionId: transaction._id,
            paymentTransactionId: paymentReferenceId || null
          }
        );

        return NextResponse.json({
          success: true,
          message: 'Withdrawal approved successfully. Please transfer the amount manually.',
          data: {
            transactionId: transaction._id,
            amount: transaction.withdrawalDetails.requestedAmount,
            netAmount: transaction.withdrawalDetails.netAmount,
            commission: transaction.commissionAmount,
            providerBalance: provider.wallet.balance,
            bankDetails: transaction.withdrawalDetails.bankDetails,
            processedAt: transaction.withdrawalDetails.processedAt
          }
        });

      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }

    } else {
      // Reject withdrawal - NO money is deducted since it was never taken
      // Just mark the request as rejected
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
          body: rejectionReason || 'Your withdrawal request was declined. The amount remains in your wallet. Please contact support for details.',
          amount: transaction.withdrawalDetails.requestedAmount,
          rejectionReason: rejectionReason,
          transactionId: transaction._id
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Withdrawal rejected. Amount remains in provider wallet.',
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
