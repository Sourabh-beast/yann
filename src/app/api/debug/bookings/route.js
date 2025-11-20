import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const providerEmail = searchParams.get('email');

    // Get all bookings
    const allBookings = await Booking.find({}).select('serviceName status customerName createdAt').sort({ createdAt: -1 }).limit(10);
    
    // Get all providers
    const allProviders = await ServiceProvider.find({}).select('name email services status');

    let matchedProvider = null;
    let matchingBookings = [];

    if (providerEmail) {
      matchedProvider = await ServiceProvider.findOne({ email: providerEmail });
      if (matchedProvider) {
        matchingBookings = await Booking.find({
          serviceName: { $in: matchedProvider.services },
          status: 'pending'
        });
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        totalBookings: await Booking.countDocuments(),
        totalProviders: await ServiceProvider.countDocuments(),
        recentBookings: allBookings.map(b => ({
          id: b._id,
          service: b.serviceName,
          customer: b.customerName,
          status: b.status,
          created: b.createdAt
        })),
        allProviders: allProviders.map(p => ({
          id: p._id,
          name: p.name,
          email: p.email,
          services: p.services,
          status: p.status
        })),
        ...(matchedProvider && {
          matchedProvider: {
            name: matchedProvider.name,
            email: matchedProvider.email,
            services: matchedProvider.services,
            status: matchedProvider.status
          },
          matchingBookings: matchingBookings.map(b => ({
            id: b._id,
            service: b.serviceName,
            customer: b.customerName,
            status: b.status
          }))
        })
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Debug failed',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
