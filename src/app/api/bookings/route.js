import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider'; // Fixed: Import ServiceProvider
import JobSession from '@/models/JobSession';
import { getPaginationParams, createPaginationMeta } from '@/lib/pagination';

const HOME_COOKIE = 'yann_home_session';

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

    const bookingDateTimeStr = `${finalDateStr}T${bookingTime}:00+05:30`;
    const bookingDateTime = new Date(bookingDateTimeStr);
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
 * GET /api/bookings
 * Get all bookings for the authenticated homeowner with pagination
 */
export async function GET(request) {
  try {
    await connectDB();

    // Verify authentication
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error', data: [] },
        { status: 500 }
      );
    }

    // Support both cookie-based (website) and token-based (mobile app) authentication
    const cookieStore = await cookies();
    let token = cookieStore.get(HOME_COOKIE)?.value;

    // If no cookie, check Authorization header for mobile app
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }


    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: [] },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Session expired', data: [] },
        { status: 401 }
      );
    }

    // Only reject if audience is explicitly set to something other than homeowner
    // Allow tokens without audience field (older tokens) or with homeowner audience
    if (decoded?.audience && decoded.audience !== 'homeowner') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: [] },
        { status: 401 }
      );
    }

    console.log('✅ Token verified, fetching homeowner:', decoded.id);

    const homeowner = await Homeowner.findById(decoded.id);
    if (!homeowner) {
      return NextResponse.json(
        { success: false, message: 'Resident not found', data: [] },
        { status: 401 }
      );
    }

    // Get pagination parameters
    const { page, limit, skip } = getPaginationParams(request);

    // Get total count for pagination
    const total = await Booking.countDocuments({ customerId: homeowner._id });

    // Get bookings for this homeowner with pagination
    const bookings = await Booking.find({ customerId: homeowner._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedProvider', 'name email phone rating profileImage')
      .populate('jobSession')
      .lean();

    const mappedBookings = bookings.map((booking) => ({
      _id: booking._id.toString(),
      id: booking._id.toString(),
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
      providerName: booking.providerName,
      provider: booking.assignedProvider ? {
        id: booking.assignedProvider._id.toString(),
        name: booking.assignedProvider.name,
        email: booking.assignedProvider.email,
        phone: maskPhoneIfEarly(booking.bookingDate, booking.bookingTime, booking.assignedProvider.phone),
        rating: booking.assignedProvider.rating,
        profileImage: booking.assignedProvider.profileImage,
      } : null,
      jobSession: booking.jobSession ? {
        id: booking.jobSession._id,
        _id: booking.jobSession._id,
        status: booking.jobSession.status,
        startTime: booking.jobSession.startTime,
        expectedDuration: booking.jobSession.expectedDuration,
        startOTP: booking.jobSession.startOTPPlain,
        endOTP: booking.jobSession.endOTPPlain,
      } : null,
      negotiation: booking.negotiation || null,
      driverDetails: booking.driverDetails || null,
      hourlyBookingDetails: booking.hourlyBookingDetails || null,
      driverRequirements: booking.driverRequirements || null,
      extras: booking.extras || [],
      notes: booking.notes || '',
      hasBeenRated: booking.hasBeenRated || false,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: mappedBookings,
      meta: {
        ...createPaginationMeta(total, page, limit),
        total: mappedBookings.length,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings', data: [], error: error.message },
      { status: 500 }
    );
  }
}
