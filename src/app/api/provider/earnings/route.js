import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * GET /api/provider/earnings
 * This is an alias for /api/provider/earning (matches mobile app expectation)
 * Returns earnings from accepted and completed bookings
 */
export async function GET(request) {
  try {
    await connectDB();

    // Get provider from headers (mobile app sends x-user-id)
    const headersList = headers();
    const userId = headersList.get('x-user-id');
    const authHeader = headersList.get('authorization');
    
    let providerId = userId;

    // Also check JWT token from cookie
    if (!providerId) {
      const token = cookies().get('yann_session')?.value;
      if (token && process.env.JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded?.audience === 'provider') {
            providerId = decoded.id;
          }
        } catch (e) {
          // Token invalid, continue with header ID
        }
      }
    }

    // Also try to decode from Authorization header
    if (!providerId && authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (process.env.JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          providerId = decoded.id || decoded.userId;
        } catch (e) {
          // Continue
        }
      }
    }

    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    console.log(`💰 Fetching earnings for provider: ${provider.name}`);

    // Get ALL bookings for this provider (accepted + completed)
    const allBookings = await Booking.find({
      assignedProvider: provider._id,
      status: { $in: ['accepted', 'in_progress', 'completed'] }
    }).sort({ createdAt: -1 });

    // Calculate earnings
    const completedBookings = allBookings.filter(b => b.status === 'completed');
    const acceptedBookings = allBookings.filter(b => b.status === 'accepted' || b.status === 'in_progress');

    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const pendingEarnings = acceptedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    // Group by service for breakdown
    const earningsByService = {};
    allBookings.forEach(booking => {
      const service = booking.serviceName || 'Unknown';
      if (!earningsByService[service]) {
        earningsByService[service] = { count: 0, total: 0 };
      }
      earningsByService[service].count++;
      earningsByService[service].total += booking.totalPrice || 0;
    });

    // Recent transactions
    const recentTransactions = allBookings.slice(0, 10).map(booking => ({
      id: booking._id.toString(),
      serviceName: booking.serviceName,
      customerName: booking.customerName,
      amount: booking.totalPrice,
      status: booking.status,
      date: booking.completedAt || booking.bookingDate || booking.createdAt
    }));

    return NextResponse.json({
      success: true,
      earnings: {
        totalEarnings,
        pendingEarnings,
        totalBookings: allBookings.length,
        completedBookings: completedBookings.length,
        acceptedBookings: acceptedBookings.length,
        averageEarning: completedBookings.length > 0 ? Math.round(totalEarnings / completedBookings.length) : 0,
        earningsByService: Object.entries(earningsByService).map(([service, data]) => ({
          service,
          count: data.count,
          total: data.total
        })),
        recentTransactions
      },
      provider: {
        id: provider._id.toString(),
        name: provider.name,
        walletBalance: provider.walletBalance || 0
      }
    });

  } catch (error) {
    console.error('Error fetching provider earnings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch earnings', error: error.message },
      { status: 500 }
    );
  }
}
