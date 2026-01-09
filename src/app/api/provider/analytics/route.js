import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import Transaction from '@/models/Transaction';
import { requireAuth } from '@/lib/authMiddleware';

/**
 * GET /api/provider/analytics
 * Get provider analytics and statistics
 */
export async function GET(request) {
    try {
        await connectDB();

        // Verify authentication
        const authResult = requireAuth(request);
        if (!authResult.authorized) {
            return authResult.response;
        }

        if (authResult.user.audience !== 'provider') {
            return NextResponse.json(
                { success: false, message: 'Provider access only' },
                { status: 403 }
            );
        }

        const providerId = authResult.user.id;
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || '30'; // days

        const daysAgo = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        // Get bookings stats
        const bookings = await Booking.find({
            assignedProvider: providerId,
            createdAt: { $gte: startDate },
        });

        const totalBookings = bookings.length;
        const completedBookings = bookings.filter(b => b.status === 'completed').length;
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
        const activeBookings = bookings.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length;

        // Get earnings
        const transactions = await Transaction.find({
            providerId,
            type: { $in: ['provider_earning', 'wallet_credit'] },
            status: 'completed',
            createdAt: { $gte: startDate },
        });

        const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0);

        // Earnings by day
        const earningsByDay = transactions.reduce((acc, t) => {
            const date = t.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

        // Popular services
        const serviceStats = bookings.reduce((acc, b) => {
            const service = b.serviceName;
            if (!acc[service]) {
                acc[service] = { count: 0, revenue: 0 };
            }
            acc[service].count++;
            acc[service].revenue += b.totalPrice || 0;
            return acc;
        }, {} as Record<string, { count: number; revenue: number }>);

        const popularServices = Object.entries(serviceStats)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Rating breakdown
        const ratingBreakdown = {
            5: bookings.filter(b => b.rating === 5).length,
            4: bookings.filter(b => b.rating === 4).length,
            3: bookings.filter(b => b.rating === 3).length,
            2: bookings.filter(b => b.rating === 2).length,
            1: bookings.filter(b => b.rating === 1).length,
        };

        const averageRating = bookings.reduce((sum, b) => sum + (b.rating || 0), 0) / (bookings.filter(b => b.rating).length || 1);

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalBookings,
                    completedBookings,
                    cancelledBookings,
                    activeBookings,
                    totalEarnings,
                    averageRating: averageRating.toFixed(1),
                    completionRate: totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0,
                },
                earningsByDay,
                popularServices,
                ratingBreakdown,
                period: daysAgo,
            },
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to load analytics' },
            { status: 500 }
        );
    }
}
