import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Transaction from '@/models/Transaction';
import ServiceProvider from '@/models/ServiceProvider';
import Booking from '@/models/Booking';
import AdminWallet from '@/models/AdminWallet';
import mongoose from 'mongoose';

// GET - Fetch all withdrawal requests with provider details and booking history
export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status') || 'pending';

        // Build query
        let query = { type: { $in: ['withdrawal_request', 'withdrawal_completed', 'withdrawal_rejected'] } };
        
        if (status === 'pending') {
          query.status = 'pending';
          query.type = 'withdrawal_request';
        } else if (status === 'completed') {
          query.type = 'withdrawal_completed';
        } else if (status === 'failed') {
          query.type = 'withdrawal_rejected';
        }

        const withdrawals = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        // Enrich with provider details and booking stats
        const enrichedWithdrawals = await Promise.all(
          withdrawals.map(async (withdrawal) => {
            // Get provider details
            const provider = await ServiceProvider.findById(withdrawal.providerId)
              .select('name phone email wallet services rating totalJobs documents')
              .lean();

            if (!provider) {
              return { ...withdrawal, provider: null, bookingStats: null };
            }

            // Get provider's booking statistics
            const [totalBookings, completedBookings, totalEarnings, recentBookings] = await Promise.all([
              Booking.countDocuments({ providerId: withdrawal.providerId }),
              Booking.countDocuments({ providerId: withdrawal.providerId, status: 'completed' }),
              Booking.aggregate([
                { $match: { providerId: withdrawal.providerId, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$payment.amount' } } }
              ]),
              Booking.find({ providerId: withdrawal.providerId })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('serviceType status payment.amount createdAt completedAt')
                .lean()
            ]);

            return {
              ...withdrawal,
              provider: {
                _id: provider._id,
                name: provider.name,
                phone: provider.phone,
                email: provider.email,
                currentBalance: provider.wallet?.balance || 0,
                rating: provider.rating,
                totalJobs: provider.totalJobs,
                services: provider.services,
                bankDetails: provider.documents?.bankDetails
                  ? {
                      accountNumber: `****${provider.documents.bankDetails.accountNumber.slice(-4)}`,
                      ifscCode: provider.documents.bankDetails.ifscCode,
                      bankName: provider.documents.bankDetails.bankName,
                      fullAccountNumber: provider.documents.bankDetails.accountNumber, // For admin
                    }
                  : null,
              },
              bookingStats: {
                totalBookings,
                completedBookings,
                totalEarnings: totalEarnings[0]?.total || 0,
                recentBookings,
              },
            };
          })
        );

        return NextResponse.json({
            success: true,
            data: enrichedWithdrawals || [],
            count: enrichedWithdrawals.length
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
