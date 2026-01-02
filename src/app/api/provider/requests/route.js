import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import JobSession from '@/models/JobSession';
import Homeowner from '@/models/Homeowner';

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

    // Build a flexible filter so providers still see bookings even if service names changed
    const providerServices = (provider.services || []).map(s => s?.toString?.().toLowerCase());
    const categoryFilters = [];

    // Detect categories from service names (handles new 36-service set)
    if (providerServices.some(s => s.includes('driver'))) categoryFilters.push('driver');
    if (providerServices.some(s => s.includes('pujari') || s.includes('pooja') || s.includes('katha') || s.includes('puja'))) categoryFilters.push('pujari');
    if (
      providerServices.some(s =>
        s.includes('clean') ||
        s.includes('laundry') ||
        s.includes('sofa') ||
        s.includes('carpet') ||
        s.includes('window') ||
        s.includes('chimney') ||
        s.includes('water tank')
      )
    ) {
      categoryFilters.push('cleaning');
    }

    const pendingQuery = {
      status: 'pending',
      'providerResponses.providerId': { $ne: provider._id }
    };

    // Prefer exact service name match when possible
    const orFilters = [];
    if (provider.services?.length) {
      orFilters.push({ serviceName: { $in: provider.services } });
    }
    if (categoryFilters.length) {
      orFilters.push({ serviceCategory: { $in: categoryFilters } });
    }

    if (orFilters.length) {
      pendingQuery.$or = orFilters;
    } else {
      // If provider has no services, avoid returning all bookings
      pendingQuery.serviceName = { $in: [] };
    }

    const pendingBookings = await Booking.find(pendingQuery)
      .sort({ createdAt: -1 })
      .select('-providerResponses')
      .populate('customerId', 'avatar');

    console.log(`📢 Found ${pendingBookings.length} pending bookings for provider ${provider.name}`);
    // ... logging ...

    // Get accepted bookings by this provider (including in_progress and completed)
    const acceptedBookings = await Booking.find({
      assignedProvider: provider._id,
      status: { $in: ['accepted', 'in_progress', 'completed'] }
    })
    .sort({ bookingDate: 1 })
    .populate('jobSession')
    .populate('customerId', 'avatar');

    // ... earnings calculation ...

    return NextResponse.json({
      success: true,
      provider: {
        // ... provider details
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
        customerAvatar: booking.customerId?.avatar || null,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        // ... rest of fields
        formattedDate: booking.formattedDate,
        basePrice: booking.basePrice,
        extras: booking.extras,
        totalPrice: booking.totalPrice,
        paymentMethod: booking.paymentMethod,
        notes: booking.notes,
        latitude: booking.latitude,
        longitude: booking.longitude,
        providerNavigationAddress: booking.providerNavigationAddress,
        createdAt: booking.createdAt,
        isPujari: booking.serviceCategory === 'pujari',
        driverDetails: booking.driverDetails || null,
        negotiation: serializeNegotiation(booking.negotiation)
      })),
      acceptedBookings: acceptedBookings.map(booking => ({
        id: booking._id,
        serviceName: booking.serviceName,
        serviceCategory: booking.serviceCategory,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerAddress: booking.customerAddress,
        customerAvatar: booking.customerId?.avatar || null,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        formattedDate: booking.formattedDate,
        totalPrice: booking.totalPrice,
        paymentMethod: booking.paymentMethod,
        notes: booking.notes,
        latitude: booking.latitude,
        longitude: booking.longitude,
        providerNavigationAddress: booking.providerNavigationAddress,
        status: booking.status,
        driverDetails: booking.driverDetails || null,
        negotiation: serializeNegotiation(booking.negotiation),
        jobSession: booking.jobSession ? {
          _id: booking.jobSession._id,
          startTime: booking.jobSession.startTime,
          expectedDuration: booking.jobSession.expectedDuration,
          status: booking.jobSession.status,
          duration: booking.jobSession.duration,
          overtimeDuration: booking.jobSession.overtimeDuration,
          baseHourlyRate: booking.jobSession.baseHourlyRate,
          overtimeRate: booking.jobSession.overtimeRate,
          overtimeCharge: booking.jobSession.overtimeCharge,
          totalCharge: booking.jobSession.totalCharge,
        } : null
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
