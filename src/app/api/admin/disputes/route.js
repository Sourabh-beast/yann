import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Transaction from '@/models/Transaction';
import Booking from '@/models/Booking';

// GET - Fetch all disputes
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    // Build query
    const query = { 'dispute.isDisputed': true };
    if (status) query['dispute.status'] = status;

    // Get disputed transactions
    const total = await Transaction.countDocuments(query);
    const disputes = await Transaction.find(query)
      .sort({ 'dispute.raisedAt': -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .populate('bookingId', 'serviceName totalPrice status bookingDate');

    // Get counts by status
    const statusCounts = await Transaction.aggregate([
      { $match: { 'dispute.isDisputed': true } },
      { $group: { _id: '$dispute.status', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        disputes,
        statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching disputes:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch disputes' },
      { status: 500 }
    );
  }
}

// POST - Create new dispute
export async function POST(request) {
  try {
    await connectDB();

    const { transactionId, reason, raisedBy } = await request.json();

    if (!transactionId || !reason || !raisedBy) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID, reason and raisedBy are required' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      {
        'dispute.isDisputed': true,
        'dispute.reason': reason,
        'dispute.raisedBy': raisedBy,
        'dispute.raisedAt': new Date(),
        'dispute.status': 'open',
        status: 'disputed'
      },
      { new: true }
    );

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dispute raised successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error creating dispute:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create dispute' },
      { status: 500 }
    );
  }
}

// PUT - Resolve dispute
export async function PUT(request) {
  try {
    await connectDB();

    const { transactionId, resolution, status, processedBy } = await request.json();

    if (!transactionId || !resolution || !status) {
      return NextResponse.json(
        { success: false, message: 'Transaction ID, resolution and status are required' },
        { status: 400 }
      );
    }

    const updateData = {
      'dispute.resolution': resolution,
      'dispute.status': status,
      processedBy
    };

    if (status === 'resolved' || status === 'closed') {
      updateData['dispute.resolvedAt'] = new Date();
      updateData.status = 'completed';
    }

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      updateData,
      { new: true }
    ).populate('customerId providerId bookingId');

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dispute updated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Error updating dispute:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update dispute' },
      { status: 500 }
    );
  }
}
