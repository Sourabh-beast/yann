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
export async function GET() {
  try {
    await connectDB();

    // Verify authentication
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error', data: [] },
        { status: 500 }
      );
    }

    const token = cookies().get(HOME_COOKIE)?.value;
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

    // Get bookings for this homeowner
    const bookings = await Booking.find({ customerEmail: homeowner.email })
      .sort({ createdAt: -1 })
      .populate('providerId', 'name email phone rating profileImage');

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
      customerEmail: booking.customerEmail,
      customerAddress: booking.customerAddress,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      provider: booking.providerId ? {
        id: booking.providerId._id.toString(),
        name: booking.providerId.name,
        email: booking.providerId.email,
        phone: booking.providerId.phone,
        rating: booking.providerId.rating,
        profileImage: booking.providerId.profileImage,
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
