import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const serviceName = searchParams.get('service');

    if (!serviceName) {
      return NextResponse.json(
        { success: false, message: 'service query parameter is required', data: [] },
        { status: 400 }
      );
    }

    const normalizedService = serviceName.trim();
    const serviceRegex = new RegExp(`^${escapeRegex(normalizedService)}$`, 'i');

    const providers = await ServiceProvider.find({
      services: { $regex: serviceRegex },
      status: 'active'
    }).select('name experience rating totalReviews serviceRates workingHours profileImage services');

    const mappedProviders = providers
      .map((provider) => {
        const price = typeof provider.getPriceForService === 'function'
          ? provider.getPriceForService(normalizedService)
          : provider.serviceRates?.find((rate) => rate.serviceName?.trim().toLowerCase() === normalizedService.toLowerCase())?.price;

        if (price === undefined || price === null) return null;

        return {
          id: provider._id.toString(),
          name: provider.name,
          experience: provider.experience,
          rating: provider.rating || 0,
          totalReviews: provider.totalReviews || 0,
          price,
          workingHours: provider.workingHours || null,
          profileImage: provider.profileImage || ''
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.price - b.price);

    return NextResponse.json(
      {
        success: true,
        data: mappedProviders,
        // Also include as 'providers' for backward compatibility
        providers: mappedProviders,
        meta: {
          total: mappedProviders.length,
          service: serviceName
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch providers for service', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load providers', data: [] },
      { status: 500 }
    );
  }
}
