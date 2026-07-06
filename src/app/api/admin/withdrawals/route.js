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

        // Batch-fetch providers and booking stats for all withdrawals in this
        // page instead of per-withdrawal queries (was up to 5 queries x 100
        // withdrawals = 500 queries per request).
        const rawProviderIds = withdrawals.map((w) => w.providerId).filter(Boolean);
        const providerIdStrings = rawProviderIds.map((id) => (id.toString ? id.toString() : String(id)));
        // Booking.providerId has been observed stored as both ObjectId and string
        // across records, so match both forms (mirrors the original per-item $or).
        const matchProviderIds = [...rawProviderIds, ...providerIdStrings];

        const [providers, bookingStatsAgg] = await Promise.all([
          ServiceProvider.find({ _id: { $in: rawProviderIds } })
            .select('name phone email wallet services rating totalJobs documents')
            .lean(),
          Booking.aggregate([
            { $match: { providerId: { $in: matchProviderIds } } },
            // Normalize providerId to string before grouping so the same
            // provider's bookings aren't split across ObjectId/string variants.
            { $addFields: { providerIdStr: { $toString: '$providerId' } } },
            { $sort: { createdAt: -1 } },
            {
              $group: {
                _id: '$providerIdStr',
                totalBookings: { $sum: 1 },
                completedBookings: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
                },
                totalEarnings: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$payment.amount', 0] },
                },
                recentBookings: {
                  $push: {
                    serviceType: '$serviceType',
                    status: '$status',
                    payment: { amount: '$payment.amount' },
                    createdAt: '$createdAt',
                    completedAt: '$completedAt',
                  },
                },
              },
            },
            { $project: { totalBookings: 1, completedBookings: 1, totalEarnings: 1, recentBookings: { $slice: ['$recentBookings', 5] } } },
          ]).option({ maxTimeMS: 5000 }),
        ]);

        const providerById = new Map(providers.map((p) => [p._id.toString(), p]));
        const statsByProviderId = new Map(bookingStatsAgg.map((s) => [s._id, s]));

        const enrichedWithdrawals = withdrawals.map((withdrawal) => {
          const providerIdStr = withdrawal.providerId?.toString ? withdrawal.providerId.toString() : String(withdrawal.providerId);
          const provider = providerById.get(providerIdStr);

          if (!provider) {
            return { ...withdrawal, provider: null, bookingStats: null };
          }

          const stats = statsByProviderId.get(providerIdStr);

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
              totalBookings: stats?.totalBookings || 0,
              completedBookings: stats?.completedBookings || 0,
              totalEarnings: stats?.totalEarnings || 0,
              recentBookings: stats?.recentBookings || [],
            },
          };
        });

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
