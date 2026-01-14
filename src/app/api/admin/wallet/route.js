import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import AdminWallet from '@/models/AdminWallet';
import Transaction from '@/models/Transaction';

// GET - Fetch admin wallet details
export async function GET(req) {
    try {
        await connectDB();

        // Get or create admin wallet (singleton pattern)
        let adminWallet = await AdminWallet.findOne();
        if (!adminWallet) {
            adminWallet = await AdminWallet.create({
                balance: 0,
                totalCommissionsEarned: 0,
                totalVolumeProcessed: 0,
            });
        }

        // Fetch recent commission transactions
        const recentTransactions = await Transaction.find({
            type: { $in: ['commission', 'withdrawal_completed'] }
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('providerId', 'name email')
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                balance: adminWallet.balance,
                totalCommissionsEarned: adminWallet.totalCommissionsEarned,
                totalVolumeProcessed: adminWallet.totalVolumeProcessed,
                lastUpdated: adminWallet.updatedAt,
                recentTransactions,
            }
        });
    } catch (error) {
        console.error('Admin wallet GET error:', error);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
