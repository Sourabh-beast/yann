import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';
import Service from '@/models/Service';

/**
 * GET /api/services/[id]/providers
 * Get all active providers for a specific service
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Service ID is required', data: [] },
        { status: 400 }
      );
    }

    // First, get the service to find its title
    const service = await Service.findById(id);
    
    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found', data: [] },
        { status: 404 }
      );
    }

    const serviceTitle = service.title;

    // Find all active providers that offer this service
    const providers = await ServiceProvider.find({
      status: 'active',
      services: { $regex: new RegExp(`^${serviceTitle}$`, 'i') },
    }).select('name email phone experience rating totalReviews serviceRates workingHours profileImage services isOnline');

    // Map providers with their pricing for this specific service
    const mappedProviders = providers.map((provider) => {
      // Find the price for this specific service
      const serviceRate = provider.serviceRates?.find(
        (rate) => rate.serviceName?.toLowerCase() === serviceTitle.toLowerCase()
      );
      const price = serviceRate?.price || null;

      return {
        id: provider._id.toString(),
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        experience: provider.experience,
        rating: provider.rating || 0,
        totalReviews: provider.totalReviews || 0,
        price: price,
        workingHours: provider.workingHours || null,
        profileImage: provider.profileImage || '',
        services: provider.services || [],
        isOnline: provider.isOnline ?? true,
      };
    }).filter(p => p.price !== null) // Only include providers with valid pricing
      .sort((a, b) => a.price - b.price); // Sort by price ascending

    return NextResponse.json({
      success: true,
      data: mappedProviders,
      service: {
        id: service._id.toString(),
        title: service.title,
        description: service.description,
        category: service.category,
        price: service.price,
        icon: service.icon,
      },
      meta: {
        total: mappedProviders.length,
        serviceName: serviceTitle,
      },
    });
  } catch (error) {
    console.error('Error fetching providers for service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch providers', data: [] },
      { status: 500 }
    );
  }
}
