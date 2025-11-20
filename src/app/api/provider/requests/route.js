import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';

export async function GET(request) {
  try {
    await connectDB();

    // Get providerId from query params
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const email = searchParams.get('email');

    if (!providerId && !email) {
      return NextResponse.json(
        { success: false, message: 'Provider ID or email is required' },
        { status: 400 }
      );
    }

    // Find provider
    let provider;
    if (providerId) {
      provider = await ServiceProvider.findById(providerId);
    } else {
      provider = await ServiceProvider.findOne({ email });
    }

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Get all pending bookings for services this provider offers
    const pendingBookings = await Booking.find({
      serviceName: { $in: provider.services },
      status: 'pending',
      'providerResponses.providerId': { $ne: provider._id } // Haven't responded yet
    })
    .sort({ createdAt: -1 })
    .select('-providerResponses');

    // Get accepted bookings by this provider
    const acceptedBookings = await Booking.find({
      assignedProvider: provider._id,
      status: { $in: ['accepted', 'completed'] }
    })
    .sort({ bookingDate: 1 });

    // Calculate earnings
    const completedBookings = await Booking.find({
      assignedProvider: provider._id,
      status: 'completed'
    });

    const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    const monthlyEarnings = completedBookings
      .filter(b => {
        const bookingMonth = new Date(b.bookingDate).getMonth();
        const currentMonth = new Date().getMonth();
        return bookingMonth === currentMonth;
      })
      .reduce((sum, booking) => sum + booking.totalPrice, 0);

    return NextResponse.json({
      success: true,
      provider: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        services: provider.services,
        rating: provider.rating,
        totalReviews: provider.totalReviews
      },
      stats: {
        pendingRequests: pendingBookings.length,
        acceptedBookings: acceptedBookings.length,
        completedBookings: completedBookings.length,
        totalEarnings,
        monthlyEarnings
      },
      pendingRequests: pendingBookings.map(booking => ({
        id: booking._id,
        serviceName: booking.serviceName,
        serviceCategory: booking.serviceCategory,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerAddress: booking.customerAddress,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        formattedDate: booking.formattedDate,
        basePrice: booking.basePrice,
        extras: booking.extras,
        totalPrice: booking.totalPrice,
        paymentMethod: booking.paymentMethod,
        notes: booking.notes,
        createdAt: booking.createdAt,
        isPujari: booking.serviceCategory === 'pujari'
      })),
      acceptedBookings: acceptedBookings.map(booking => ({
        id: booking._id,
        serviceName: booking.serviceName,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        formattedDate: booking.formattedDate,
        totalPrice: booking.totalPrice,
        status: booking.status
      }))
    }, { status: 200 });

  } catch (error) {
    console.error('Provider requests fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch requests',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
