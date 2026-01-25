import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * GET /api/providers
 * Get all active providers with optional filtering
 * Query params: 
 *   - service (optional): filter by service name
 *   - status (optional): filter by status (default: active)
 *   - limit (optional): limit results
 *   - page (optional): pagination
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const skip = (page - 1) * limit;

    // Build query
    const query = { status };
    
    if (service) {
      query.services = { $regex: new RegExp(service.trim(), 'i') };
    }

    // Get providers
    const [providers, total] = await Promise.all([
      ServiceProvider.find(query)
        .select('name email phone experience rating totalReviews serviceRates workingHours profileImage services status isOnline')
        .sort({ rating: -1, totalReviews: -1 })
        .skip(skip)
        .limit(limit),
      ServiceProvider.countDocuments(query),
    ]);

    const mappedProviders = providers.map((provider) => ({
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
      isOnline: provider.isOnline ?? true,
    }));

    return NextResponse.json({
      success: true,
      data: mappedProviders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch providers', data: [] },
      { status: 500 }
    );
  }
}
