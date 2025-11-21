import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function GET(request) {
  try {
    await connectDB();

    // Fetch all bookings sorted by creation date (newest first)
    const bookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      bookings: bookings.map(booking => ({
        _id: booking._id.toString(),
        serviceName: booking.serviceName,
        serviceCategory: booking.serviceCategory,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerAddress: booking.customerAddress,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        basePrice: booking.basePrice,
        totalPrice: booking.totalPrice,
        paymentMethod: booking.paymentMethod,
        billingType: booking.billingType,
        quantity: booking.quantity,
        status: booking.status,
        assignedProvider: booking.assignedProvider,
        providerName: booking.providerName,
        notes: booking.notes,
        createdAt: booking.createdAt,
        driverDetails: booking.driverDetails || null,
        extras: booking.extras || []
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('Admin bookings fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch bookings',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
