import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';
import Booking from '@/models/Booking';

/**
 * Calculate average response time for a provider
 */
async function calculateAverageResponseTime(providerId) {
  try {
    // Find all bookings where this provider has responded
    const bookings = await Booking.find({
      'providerResponses.providerId': providerId,
      'providerResponses.response': { $in: ['accepted', 'rejected'] }
    }).select('createdAt providerResponses');

    if (!bookings || bookings.length === 0) {
      return { time: 'New', count: 0 }; // No data yet
    }

    let totalResponseTimeMinutes = 0;
    let responseCount = 0;

    bookings.forEach(booking => {
      const providerResponse = booking.providerResponses.find(
        r => r.providerId.toString() === providerId.toString() &&
          (r.response === 'accepted' || r.response === 'rejected')
      );

      if (providerResponse && providerResponse.respondedAt) {
        const responseTime = new Date(providerResponse.respondedAt) - new Date(booking.createdAt);
        totalResponseTimeMinutes += responseTime / (1000 * 60); // Convert to minutes
        responseCount++;
      }
    });

    if (responseCount === 0) {
      return { time: 'New', count: 0 };
    }

    const avgMinutes = totalResponseTimeMinutes / responseCount;

    // Format response time
    let formattedTime;
    if (avgMinutes < 60) {
      formattedTime = '< 1 hr';
    } else if (avgMinutes < 1440) { // Less than 24 hours
      const hours = Math.round(avgMinutes / 60);
      formattedTime = `${hours} hr${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.round(avgMinutes / 1440);
      formattedTime = `${days} day${days > 1 ? 's' : ''}`;
    }

    return { time: formattedTime, count: responseCount };
  } catch (error) {
    console.error('Error calculating response time:', error);
    return { time: 'New', count: 0 }; // Fallback
  }
}

/**
 * GET /api/providers/[id]
 * Get a specific provider by ID
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const provider = await ServiceProvider.findById(id)
      .select('name email phone experience rating totalReviews serviceRates workingHours profileImage services status bio isVerified aadhaarVerified isOnline');

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Calculate average response time
    const responseTimeData = await calculateAverageResponseTime(id);

    return NextResponse.json({
      success: true,
      data: {
        id: provider._id.toString(),
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        experience: provider.experience,
        rating: provider.rating || 0,
        totalReviews: provider.totalReviews || 0,
        services: provider.services || [],
        serviceRates: provider.serviceRates || [],
        workingHours: provider.workingHours || null,
        profileImage: provider.profileImage || '',
        status: provider.status,
        bio: provider.bio || '',
        isVerified: provider.isVerified || provider.aadhaarVerified || false,
        aadhaarVerified: provider.aadhaarVerified || false,
        isOnline: provider.isOnline ?? true,
        hasLateStarts: provider.hasLateStarts || false,
        averageResponseTime: responseTimeData.time,
        responseCount: responseTimeData.count,
      },
    });
  } catch (error) {
    console.error('Error fetching provider:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch provider' },
      { status: 500 }
    );
  }
}
