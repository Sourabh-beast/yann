import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';

const PROVIDER_COOKIE = 'yann_session';

/**
 * Helper to get authenticated provider from session
 */
async function getAuthenticatedProvider() {
  if (!process.env.JWT_SECRET) {
    return { error: 'Server configuration error', status: 500 };
  }

  const token = cookies().get(PROVIDER_COOKIE)?.value;
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
 * GET /api/provider/bookings
 * Get all bookings for the authenticated provider
 * Query params: status (optional) - filter by status
 */
export async function GET(request) {
  try {
    await connectDB();

    const authResult = await getAuthenticatedProvider();
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
      .populate('customerId', 'name email phone');

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
      customerPhone: booking.customerPhone,
      customerAddress: booking.customerAddress,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      customer: booking.customerId ? {
        id: booking.customerId._id?.toString(),
        name: booking.customerId.name,
        email: booking.customerId.email,
        phone: booking.customerId.phone,
      } : null,
      driverDetails: booking.driverDetails || null,
      extras: booking.extras || [],
      notes: booking.notes || '',
      startedAt: booking.startedAt,
      completedAt: booking.completedAt,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
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
      customerPhone: booking.customerPhone,
      customerAddress: booking.customerAddress,
      paymentMethod: booking.paymentMethod,
      notes: booking.notes || '',
      driverDetails: booking.driverDetails || null,
      createdAt: booking.createdAt,
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
