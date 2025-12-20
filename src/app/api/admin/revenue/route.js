import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Transaction from '@/models/Transaction';
import Booking from '@/models/Booking';

// GET - Revenue reports with date filters
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly, yearly
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Calculate date ranges
    let start, end;
    const now = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case 'daily':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          break;
        case 'weekly':
          const dayOfWeek = now.getDay();
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - dayOfWeek));
          break;
        case 'monthly':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'yearly':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = now;
      }
    }

    // Get revenue from completed bookings
    const completedBookings = await Booking.find({
      status: { $in: ['completed', 'accepted'] },
      paymentStatus: 'paid',
      createdAt: { $gte: start, $lte: end }
    });

    // Get transactions for commission data
    const transactions = await Transaction.find({
      type: 'payment',
      status: 'completed',
      createdAt: { $gte: start, $lte: end }
    });

    // Calculate totals
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalBookings = completedBookings.length;
    const totalCommission = transactions.reduce((sum, t) => sum + (t.commissionAmount || 0), 0);
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Get refunds
    const refunds = await Transaction.find({
      type: 'refund',
      createdAt: { $gte: start, $lte: end }
    });
    const totalRefunds = refunds.reduce((sum, r) => sum + (r.refundAmount || 0), 0);

    // Revenue by service category
    const revenueByCategory = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'accepted'] },
          paymentStatus: 'paid',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$serviceCategory',
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Revenue by payment method
    const revenueByPaymentMethod = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'accepted'] },
          paymentStatus: 'paid',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Daily breakdown for charts
    const dailyRevenue = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'accepted'] },
          paymentStatus: 'paid',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top services by revenue
    const topServices = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'accepted'] },
          paymentStatus: 'paid',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$serviceName',
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Get previous period for comparison
    const periodDuration = end - start;
    const prevStart = new Date(start - periodDuration);
    const prevEnd = start;

    const prevBookings = await Booking.find({
      status: { $in: ['completed', 'accepted'] },
      paymentStatus: 'paid',
      createdAt: { $gte: prevStart, $lte: prevEnd }
    });
    const prevRevenue = prevBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalBookings,
          totalCommission,
          avgBookingValue: Math.round(avgBookingValue),
          totalRefunds,
          netRevenue: totalRevenue - totalRefunds,
          revenueGrowth: Math.round(revenueGrowth * 100) / 100
        },
        charts: {
          revenueByCategory,
          revenueByPaymentMethod,
          dailyRevenue,
          topServices
        },
        period: {
          start,
          end,
          type: period
        }
      }
    });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}
