import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import Homeowner from '@/models/Homeowner';

const HOME_COOKIE = 'yann_home_session';

/**
 * GET /api/bookings
 * Get all bookings for the authenticated homeowner
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
    let token = cookies().get(HOME_COOKIE)?.value;
    
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

    if (decoded?.audience !== 'homeowner') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: [] },
        { status: 401 }
      );
    }

    const homeowner = await Homeowner.findById(decoded.id);
    if (!homeowner) {
      return NextResponse.json(
        { success: false, message: 'Resident not found', data: [] },
        { status: 401 }
      );
    }

    // Get bookings for this homeowner (using customerId, not customerEmail)
    const bookings = await Booking.find({ customerId: homeowner._id })
      .sort({ createdAt: -1 })
      .populate('assignedProvider', 'name email phone rating profileImage');

    const mappedBookings = bookings.map((booking) => ({
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
        phone: booking.assignedProvider.phone,
        rating: booking.assignedProvider.rating,
        profileImage: booking.assignedProvider.profileImage,
      } : null,
      negotiation: booking.negotiation || null,
      driverDetails: booking.driverDetails || null,
      extras: booking.extras || [],
      notes: booking.notes || '',
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: mappedBookings,
      meta: {
        total: mappedBookings.length,
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings', data: [] },
      { status: 500 }
    );
  }
}
