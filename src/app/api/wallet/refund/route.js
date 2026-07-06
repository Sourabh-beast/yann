import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import Transaction from '@/models/Transaction';
import Booking from '@/models/Booking';

// GET: Check for failed transactions that need refund
export async function GET(req) {
  try {
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find wallet_debit transactions from last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const failedTransactions = await Transaction.find({
      customerId: userId,
      type: 'wallet_debit',
      status: 'completed',
      createdAt: { $gte: oneDayAgo },
      refunded: { $ne: true } // Not already refunded
    }).lean();

    // Batch-check which transactions don't have corresponding bookings
    // (was one Booking.findById per transaction, sequentially awaited)
    const bookingIds = failedTransactions.map((t) => t.bookingId).filter(Boolean);
    const existingBookings = await Booking.find({ _id: { $in: bookingIds } }).select('_id').lean();
    const existingBookingIds = new Set(existingBookings.map((b) => b._id.toString()));

    const refundableTransactions = failedTransactions
      .filter((t) => t.bookingId && !existingBookingIds.has(t.bookingId.toString()))
      .map((transaction) => ({
        transactionId: transaction._id,
        amount: transaction.amount,
        description: transaction.description,
        createdAt: transaction.createdAt
      }));

    return NextResponse.json({
      success: true,
      refundableTransactions,
      totalRefundable: refundableTransactions.reduce((sum, t) => sum + t.amount, 0)
    });
  } catch (error) {
    console.error('Failed transaction check error:', error);
    return NextResponse.json({ success: false, message: 'Failed to check transactions' }, { status: 500 });
  }
}

// POST: Process automatic refund for failed transactions
export async function POST(req) {
  try {
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await Homeowner.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Find all refundable transactions
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const failedTransactions = await Transaction.find({
      customerId: userId,
      type: 'wallet_debit',
      status: 'completed',
      createdAt: { $gte: oneDayAgo },
      refunded: { $ne: true }
    }).lean();

    // Batch-check which transactions are refundable (was sequential findById per transaction)
    const bookingIds = failedTransactions.map((t) => t.bookingId).filter(Boolean);
    const existingBookings = await Booking.find({ _id: { $in: bookingIds } }).select('_id').lean();
    const existingBookingIds = new Set(existingBookings.map((b) => b._id.toString()));

    const refundable = failedTransactions.filter(
      (t) => t.bookingId && !existingBookingIds.has(t.bookingId.toString())
    );
    const totalRefundAmount = refundable.reduce((sum, t) => sum + t.amount, 0);
    const refundedTransactionIds = refundable.map((t) => t._id);

    if (totalRefundAmount === 0) {
      return NextResponse.json({
        success: false,
        message: 'No refundable transactions found'
      }, { status: 400 });
    }

    // Process refund
    const balanceBefore = user.wallet?.balance || 0;
    const balanceAfter = balanceBefore + totalRefundAmount;

    user.wallet.balance = balanceAfter;
    await user.save();

    // Mark original transactions as refunded
    await Transaction.updateMany(
      { _id: { $in: refundedTransactionIds } },
      { $set: { refunded: true, refundedAt: new Date() } }
    );

    // Create refund transaction record
    await Transaction.create({
      customerId: userId,
      type: 'refund',
      amount: totalRefundAmount,
      balanceBefore,
      balanceAfter,
      description: `Auto-refund for ${refundedTransactionIds.length} failed booking(s)`,
      status: 'completed',
      paymentMethod: 'wallet',
      currency: 'INR',
      metadata: {
        refundedTransactions: refundedTransactionIds,
        reason: 'Failed booking - automatic refund'
      }
    });

    console.log('✅ Auto-refund processed:', {
      userId,
      amount: totalRefundAmount,
      transactionCount: refundedTransactionIds.length,
      balanceBefore,
      balanceAfter
    });

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      refundAmount: totalRefundAmount,
      transactionCount: refundedTransactionIds.length,
      newBalance: balanceAfter
    });
  } catch (error) {
    console.error('❌ Auto-refund error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Refund failed' 
    }, { status: 500 });
  }
}
