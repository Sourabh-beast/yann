import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Transaction from '@/models/Transaction';
import Booking from '@/models/Booking';

// GET - Fetch all transactions with filters
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    // Build query
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Transaction.countDocuments(query);

    // Get transactions
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .populate('bookingId', 'serviceName totalPrice status');

    // Calculate totals
    const allTransactions = await Transaction.find(query);
    const totals = {
      totalAmount: allTransactions.reduce((sum, t) => sum + (t.amount || 0), 0),
      totalCommission: allTransactions.reduce((sum, t) => sum + (t.commissionAmount || 0), 0),
      totalRefunds: allTransactions.filter(t => t.type === 'refund').reduce((sum, t) => sum + (t.amount || 0), 0),
      totalDisputed: allTransactions.filter(t => t.dispute?.isDisputed).length
    };

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        totals,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST - Create refund
export async function POST(request) {
  try {
    await connectDB();

    const { bookingId, amount, reason, processedBy } = await request.json();

    if (!bookingId || !amount || !reason) {
      return NextResponse.json(
        { success: false, message: 'Booking ID, amount and reason are required' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('customerId')
      .populate('assignedProvider');

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Create refund transaction
    const refund = await Transaction.create({
      bookingId,
      type: 'refund',
      amount,
      refundAmount: amount,
      refundReason: reason,
      refundedAt: new Date(),
      status: 'refunded',
      paymentMethod: booking.paymentMethod || 'razorpay',
      customerId: booking.customerId?._id,
      providerId: booking.assignedProvider?._id,
      serviceName: booking.serviceName,
      serviceCategory: booking.serviceCategory,
      processedBy,
      notes: `Refund processed: ${reason}`
    });

    // Update booking payment status
    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'refunded'
    });

    return NextResponse.json({
      success: true,
      message: 'Refund processed successfully',
      data: refund
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
