import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';

const PROVIDER_COOKIE = 'yann_session';

/**
 * Helper to mask phone numbers if the booking is > 3 hours away.
 */
function maskPhoneIfEarly(bookingDate, bookingTime, phone) {
  if (!phone || phone === 'N/A') return 'N/A';
  if (!bookingDate || !bookingTime) return phone;

  try {
    let dateStr = bookingDate.toString();
    if (dateStr.includes('T')) dateStr = dateStr.split('T')[0];

    // YYYY-MM-DD from the DB Date object typically
    const d = new Date(bookingDate);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    const finalDateStr = `${yr}-${mo}-${da}`;

    const bookingDateTime = new Date(`${finalDateStr}T${bookingTime}`);
    if (isNaN(bookingDateTime.getTime())) return phone;

    const now = new Date();
    const threeHoursBefore = new Date(bookingDateTime.getTime() - 3 * 60 * 60 * 1000);

    if (now.getTime() < threeHoursBefore.getTime()) {
      return 'N/A'; // Hide phone
    }
  } catch (e) {
    return phone;
  }

  return phone;
}


/**
 * Helper to get authenticated provider from session
 * Supports: cookie-based (website), token-based (mobile), and x-user-id header (mobile)
 */
async function getAuthenticatedProvider(request) {
  // First try x-user-id header (mobile app sends this)
  const headersList = headers();
  const userId = headersList.get('x-user-id');

  if (userId) {
    const provider = await ServiceProvider.findById(userId);
    if (provider) {
      console.log(`📱 Found provider via x-user-id: ${provider.name}`);
      return { provider };
    }
  }

  // Then try JWT from cookie or Authorization header
  const cookieStore = await cookies();
  let token = cookieStore.get(PROVIDER_COOKIE)?.value;

  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (token && process.env.JWT_SECRET) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const providerId = decoded.id || decoded.userId;
      const provider = await ServiceProvider.findById(providerId);
      if (provider) {
        console.log(`🔑 Found provider via JWT: ${provider.name}`);
        return { provider };
      }
    } catch (error) {
      console.log('JWT verification failed:', error.message);
    }
  }

  return { error: 'Unauthorized - Please login', status: 401 };
}

/**
 * GET /api/provider/bookings
 * Get all bookings for the authenticated provider
 * Query params: status (optional) - filter by status
 */
export async function GET(request) {
  try {
    await connectDB();

    const authResult = await getAuthenticatedProvider(request);
    if (authResult.error) {
      return NextResponse.json(
        { success: false, message: authResult.error, bookings: [] },
        { status: authResult.status }
      );
    }

    const { provider } = authResult;
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    console.log(`📋 Fetching bookings for provider: ${provider.name} (${provider._id})`);

    // Build query - ONLY bookings assigned to this provider
    const query = {
      assignedProvider: provider._id
    };

    // Add status filter if provided
    if (statusFilter && statusFilter !== 'all') {
      query.status = statusFilter;
    }

    // Get bookings assigned to this provider
    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .populate('customerId', 'name email phone')
      .populate('jobSession'); // Populate job session details

    console.log(`✅ Found ${bookings.length} bookings for provider ${provider.name}`);

    // Also get pending requests (bookings not yet assigned but matching provider's services)
    const pendingRequests = await Booking.find({
      serviceName: { $in: provider.services },
      status: 'pending',
      assignedProvider: null,
      'providerResponses.providerId': { $ne: provider._id }
    }).sort({ createdAt: -1 });

    console.log(`📢 Found ${pendingRequests.length} pending requests for provider's services`);

    const mappedBookings = bookings.map((booking) => ({
      id: booking._id.toString(),
      _id: booking._id.toString(),
      serviceId: booking.serviceId,
      serviceName: booking.serviceName,
      serviceCategory: booking.serviceCategory,
      status: booking.status,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      totalPrice: booking.totalPrice,
      basePrice: booking.basePrice,
      customerName: booking.customerName,
      customerPhone: maskPhoneIfEarly(booking.bookingDate, booking.bookingTime, booking.customerPhone),
      customerAddress: booking.customerAddress,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      walletPaymentStage: booking.walletPaymentStage || null,
      escrowDetails: booking.escrowDetails || null,
      jobSession: booking.jobSession ? {
        _id: booking.jobSession._id,
        id: booking.jobSession._id,
        status: booking.jobSession.status,
        startTime: booking.jobSession.startTime,
        expectedDuration: booking.jobSession.expectedDuration,
        startOTP: booking.jobSession.startOTPPlain,
        endOTP: booking.jobSession.endOTPPlain,
      } : null,
      customer: booking.customerId ? {
        id: booking.customerId._id?.toString(),
        name: booking.customerId.name,
        email: booking.customerId.email,
        phone: maskPhoneIfEarly(booking.bookingDate, booking.bookingTime, booking.customerId.phone),
      } : null,
      driverDetails: booking.driverDetails || null,
      extras: booking.extras || [],
      notes: booking.notes || '',
      startedAt: booking.startedAt,
      completedAt: booking.completedAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      customerAvatar: booking.customerId?.profileImage || null,
    }));

    const mappedPendingRequests = pendingRequests.map((booking) => ({
      id: booking._id.toString(),
      _id: booking._id.toString(),
      serviceId: booking.serviceId,
      serviceName: booking.serviceName,
      serviceCategory: booking.serviceCategory,
      status: booking.status,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      totalPrice: booking.totalPrice,
      basePrice: booking.basePrice,
      customerName: booking.customerName,
      customerPhone: maskPhoneIfEarly(booking.bookingDate, booking.bookingTime, booking.customerPhone),
      customerAddress: booking.customerAddress,
      paymentMethod: booking.paymentMethod,
      notes: booking.notes || '',
      driverDetails: booking.driverDetails || null,
      driverDetails: booking.driverDetails || null,
      createdAt: booking.createdAt,
      requestTimer: booking.requestTimer, // Include timer details for sync
    }));

    return NextResponse.json({
      success: true,
      bookings: mappedBookings,
      pendingRequests: mappedPendingRequests,
      meta: {
        total: mappedBookings.length,
        pendingCount: mappedPendingRequests.length,
        providerId: provider._id.toString(),
        providerName: provider.name
      }
    });

  } catch (error) {
    console.error('Error fetching provider bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings', bookings: [] },
      { status: 500 }
    );
  }
}
