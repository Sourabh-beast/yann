import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';

const PROVIDER_COOKIE = 'yann_session';

/**
 * Helper to get authenticated provider from session
 * Supports both cookie-based (website) and token-based (mobile app) authentication
 */
async function getAuthenticatedProvider(request) {
  if (!process.env.JWT_SECRET) {
    return { error: 'Server configuration error', status: 500 };
  }

  // Support both cookie-based (website) and token-based (mobile app) authentication
  let token = cookies().get(PROVIDER_COOKIE)?.value;

  // If no cookie, check Authorization header for mobile app
  if (!token) {
    const authHeader = request?.headers?.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return { error: 'Unauthorized - Please login', status: 401 };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return { error: 'Session expired - Please login again', status: 401 };
  }

  // Only reject if audience is explicitly set to something other than provider
  // Allow tokens without audience field (mobile app tokens)
  if (decoded?.audience && decoded.audience !== 'provider') {
    return { error: 'Unauthorized - Provider access only', status: 401 };
  }

  const provider = await ServiceProvider.findById(decoded.id);
  if (!provider) {
    return { error: 'Provider not found', status: 404 };
  }

  return { provider };
}

/**
 * GET /api/provider/earnings
 * Get earnings breakdown for the authenticated provider
 * Query params: period (week, month, year, all)
 */
export async function GET(request) {
  try {
    await connectDB();

    const authResult = await getAuthenticatedProvider(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: authResult.status }
      );
    }

    const { provider } = authResult;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    console.log(`💰 Fetching earnings for provider: ${provider.name}, period: ${period}`);

    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Get completed bookings in the period
    const completedBookings = await Booking.find({
      assignedProvider: provider._id,
      status: 'completed',
      completedAt: { $gte: startDate }
    })
      .sort({ completedAt: -1 })
      .select('serviceName totalPrice bookingDate completedAt customerName');

    // Calculate totals
    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const bookingsCount = completedBookings.length;
    const averageEarning = bookingsCount > 0 ? totalEarnings / bookingsCount : 0;

    // Group by service
    const earningsByService = {};
    completedBookings.forEach(booking => {
      const service = booking.serviceName || 'Unknown';
      if (!earningsByService[service]) {
        earningsByService[service] = { count: 0, total: 0 };
      }
      earningsByService[service].count++;
      earningsByService[service].total += booking.totalPrice || 0;
    });

    // Group by date (for charts)
    const earningsByDate = {};
    completedBookings.forEach(booking => {
      const date = new Date(booking.completedAt || booking.bookingDate).toISOString().split('T')[0];
      if (!earningsByDate[date]) {
        earningsByDate[date] = 0;
      }
      earningsByDate[date] += booking.totalPrice || 0;
    });

    // Recent transactions
    const recentTransactions = completedBookings.slice(0, 10).map(booking => ({
      id: booking._id.toString(),
      serviceName: booking.serviceName,
      customerName: booking.customerName,
      amount: booking.totalPrice,
      date: booking.completedAt || booking.bookingDate
    }));

    return NextResponse.json({
      success: true,
      earnings: {
        period,
        totalEarnings,
        bookingsCount,
        averageEarning: Math.round(averageEarning),
        earningsByService: Object.entries(earningsByService).map(([service, data]) => ({
          service,
          count: data.count,
          total: data.total
        })),
        earningsByDate: Object.entries(earningsByDate).map(([date, total]) => ({
          date,
          total
        })).sort((a, b) => new Date(a.date) - new Date(b.date)),
        recentTransactions
      },
      provider: {
        id: provider._id.toString(),
        name: provider.name
      }
    });

  } catch (error) {
    console.error('Error fetching provider earnings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
