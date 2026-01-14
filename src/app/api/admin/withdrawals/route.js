import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Transaction from '@/models/Transaction';
import ServiceProvider from '@/models/ServiceProvider';
import AdminWallet from '@/models/AdminWallet';
import mongoose from 'mongoose';

// GET - Fetch all withdrawal requests
export async function GET(req) {
    try {
        await connectDB();

        const withdrawals = await Transaction.find({
            type: { $in: ['withdrawal_request', 'withdrawal_completed', 'withdrawal_rejected'] }
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('providerId', 'name email phone wallet')
            .lean();

        return NextResponse.json({
            success: true,
            data: withdrawals || [],
        });
    } catch (error) {
        console.error('Admin withdrawals GET error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

// PUT - Approve or Reject a withdrawal
export async function PUT(req) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await connectDB();
        const { withdrawalId, action, reason, processedBy } = await req.json();

        if (!withdrawalId || !action) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        // Find the withdrawal transaction
        const withdrawal = await Transaction.findById(withdrawalId).session(session);
        if (!withdrawal) {
            await session.abortTransaction();
            return NextResponse.json({ success: false, message: 'Withdrawal not found' }, { status: 404 });
        }

        if (withdrawal.type !== 'withdrawal_request' || withdrawal.status !== 'pending') {
            await session.abortTransaction();
            return NextResponse.json({ success: false, message: 'Withdrawal already processed' }, { status: 400 });
        }

        const provider = await ServiceProvider.findById(withdrawal.providerId).session(session);
        if (!provider) {
            await session.abortTransaction();
            return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });
        }

        if (action === 'approve') {
            // Mark withdrawal as completed
            withdrawal.type = 'withdrawal_completed';
            withdrawal.status = 'completed';
            withdrawal.withdrawalDetails = {
                ...withdrawal.withdrawalDetails,
                processedAt: new Date(),
                processedBy,
            };
            await withdrawal.save({ session });

            await session.commitTransaction();
            return NextResponse.json({
                success: true,
                message: 'Withdrawal approved and processed',
                data: { withdrawalId, status: 'completed' }
            });

        } else if (action === 'reject') {
            // Return funds to provider's wallet
            const refundAmount = withdrawal.amount;

            provider.wallet.balance += refundAmount;
            await provider.save({ session });

            // Update withdrawal transaction
            withdrawal.type = 'withdrawal_rejected';
            withdrawal.status = 'failed';
            withdrawal.withdrawalDetails = {
                ...withdrawal.withdrawalDetails,
                rejectedAt: new Date(),
                rejectedBy: processedBy,
                rejectionReason: reason,
            };
            await withdrawal.save({ session });

            // Refund the commission from admin wallet (if applicable)
            const adminWallet = await AdminWallet.findOne().session(session);
            if (adminWallet && withdrawal.withdrawalDetails?.commission) {
                adminWallet.balance -= withdrawal.withdrawalDetails.commission;
                adminWallet.totalCommissionsEarned -= withdrawal.withdrawalDetails.commission;
                await adminWallet.save({ session });
            }

            await session.commitTransaction();
            return NextResponse.json({
                success: true,
                message: 'Withdrawal rejected and funds returned to provider',
                data: { withdrawalId, status: 'rejected', refundedAmount: refundAmount }
            });

        } else {
            await session.abortTransaction();
            return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        await session.abortTransaction();
        console.error('Admin withdrawals PUT error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    } finally {
        session.endSession();
    }
}
