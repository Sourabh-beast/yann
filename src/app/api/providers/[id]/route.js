import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * GET /api/providers/[id]
 * Get a specific provider by ID
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const provider = await ServiceProvider.findById(id)
      .select('name email phone experience rating totalReviews serviceRates workingHours profileImage services status bio');

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

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
