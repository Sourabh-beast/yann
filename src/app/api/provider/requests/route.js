import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';

const serializeNegotiation = (negotiation) => {
  if (!negotiation) return null;
  return {
    isActive: negotiation.isActive,
    proposedAmount: negotiation.proposedAmount,
    status: negotiation.status,
    providerId: negotiation.providerId ? negotiation.providerId.toString() : null,
    providerName: negotiation.providerName,
    note: negotiation.note,
    createdAt: negotiation.createdAt,
  };
};

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

    console.log('🔍 Provider found:', provider.name);
    console.log('📋 Provider services:', provider.services);
    console.log('✅ Provider status:', provider.status);

    // Get all pending bookings for services this provider offers
    const pendingBookings = await Booking.find({
      serviceName: { $in: provider.services }, // Exact match with provider's services
      status: 'pending',
      'providerResponses.providerId': { $ne: provider._id } // Haven't responded yet
    })
    .sort({ createdAt: -1 })
    .select('-providerResponses');

    console.log(`📢 Found ${pendingBookings.length} pending bookings for provider ${provider.name}`);
    if (pendingBookings.length > 0) {
      pendingBookings.forEach(b => {
        console.log(`   - ${b.serviceName} (${b.customerName}) - ${b.formattedDate}`);
      });
    } else {
      console.log('💡 Tip: Make sure bookings have exact service names matching provider services');
      console.log('   Provider services:', provider.services);
      
      // Check all pending bookings to see what's available
      const allPending = await Booking.find({ status: 'pending' }).select('serviceName');
      if (allPending.length > 0) {
        console.log('   All pending booking services:', allPending.map(b => b.serviceName));
      }
    }

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
        isPujari: booking.serviceCategory === 'pujari',
        driverDetails: booking.driverDetails || null,
        negotiation: serializeNegotiation(booking.negotiation)
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
        status: booking.status,
        driverDetails: booking.driverDetails || null,
        negotiation: serializeNegotiation(booking.negotiation)
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
