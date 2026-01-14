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
  const cookieStore = await cookies();
  let token = cookieStore.get(PROVIDER_COOKIE)?.value;
  
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

  if (decoded?.audience !== 'provider') {
    return { error: 'Unauthorized - Provider access only', status: 401 };
  }

  const provider = await ServiceProvider.findById(decoded.id);
  if (!provider) {
    return { error: 'Provider not found', status: 404 };
  }

  return { provider };
}

/**
 * GET /api/provider/stats
 * Get statistics for the authenticated provider
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

    console.log(`📊 Fetching stats for provider: ${provider.name}`);

    // Get booking counts by status
    const [
      pendingCount,
      acceptedCount,
      inProgressCount,
      completedCount,
      cancelledCount,
      totalBookings
    ] = await Promise.all([
      Booking.countDocuments({ assignedProvider: provider._id, status: 'pending' }),
      Booking.countDocuments({ assignedProvider: provider._id, status: 'accepted' }),
      Booking.countDocuments({ assignedProvider: provider._id, status: 'in_progress' }),
      Booking.countDocuments({ assignedProvider: provider._id, status: 'completed' }),
      Booking.countDocuments({ assignedProvider: provider._id, status: 'cancelled' }),
      Booking.countDocuments({ assignedProvider: provider._id })
    ]);

    // Get pending requests (not yet assigned)
    const pendingRequestsCount = await Booking.countDocuments({
      serviceName: { $in: provider.services },
      status: 'pending',
      assignedProvider: null
    });

    // Calculate earnings
    const completedBookings = await Booking.find({
      assignedProvider: provider._id,
      status: 'completed'
    }).select('totalPrice bookingDate completedAt');

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    const todayEarnings = completedBookings
      .filter(b => new Date(b.completedAt || b.bookingDate) >= startOfToday)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const weeklyEarnings = completedBookings
      .filter(b => new Date(b.completedAt || b.bookingDate) >= startOfWeek)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const monthlyEarnings = completedBookings
      .filter(b => new Date(b.completedAt || b.bookingDate) >= startOfMonth)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Get upcoming bookings (next 7 days)
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    
    const upcomingBookings = await Booking.countDocuments({
      assignedProvider: provider._id,
      status: { $in: ['accepted', 'in_progress'] },
      bookingDate: { $gte: startOfToday, $lte: nextWeek }
    });

    return NextResponse.json({
      success: true,
      stats: {
        // Booking counts
        totalBookings,
        pendingRequests: pendingRequestsCount,
        pendingCount,
        acceptedCount,
        inProgressCount,
        completedCount,
        cancelledCount,
        upcomingBookings,

        // Earnings
        totalEarnings,
        todayEarnings,
        weeklyEarnings,
        monthlyEarnings,

        // Provider info
        rating: provider.rating || 0,
        totalReviews: provider.totalReviews || 0,
        servicesCount: provider.services?.length || 0,
        status: provider.status
      },
      provider: {
        id: provider._id.toString(),
        name: provider.name,
        email: provider.email,
        services: provider.services,
        status: provider.status
      }
    });

  } catch (error) {
    console.error('Error fetching provider stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
