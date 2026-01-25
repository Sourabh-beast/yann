import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const serviceName = searchParams.get('service');
    const experienceMin = searchParams.get('experienceMin');
    const experienceMax = searchParams.get('experienceMax');
    const excludeProviderId = searchParams.get('excludeProviderId');

    if (!serviceName) {
      return NextResponse.json(
        { success: false, message: 'service query parameter is required', data: [] },
        { status: 400 }
      );
    }

    const normalizedService = serviceName.trim();
    const serviceRegex = new RegExp(`^${escapeRegex(normalizedService)}$`, 'i');

    // Build query with experience range filtering
    const query = {
      services: { $regex: serviceRegex }
    };

    // Add experience range filter if provided
    if (experienceMin !== null && experienceMin !== undefined) {
      const min = parseInt(experienceMin);
      query.experience = { $gte: min };
      console.log(`🔍 Adding experience filter: >= ${min}`);
    }
    if (experienceMax !== null && experienceMax !== undefined) {
      const max = parseInt(experienceMax);
      if (query.experience) {
        query.experience.$lte = max; // Changed from $lt to $lte (inclusive)
      } else {
        query.experience = { $lte: max };
      }
      console.log(`🔍 Adding experience filter: <= ${max}`);
    }

    console.log('📊 Final MongoDB query:', JSON.stringify(query));

    // Exclude specific provider if requested (for fallback scenarios)
    if (excludeProviderId) {
      query._id = { $ne: excludeProviderId };
    }

    // Fetch ALL providers for this service (including offline ones)
    // Mobile app will handle displaying offline providers as grayed out
    const providers = await ServiceProvider.find(query).select('name experience rating totalReviews serviceRates workingHours profileImage services status');

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
          serviceRates: provider.serviceRates || [],
          workingHours: provider.workingHours || null,
          profileImage: provider.profileImage || '',
          status: provider.status || 'active' // Include status so mobile app can show offline state
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        // Sort active providers first, then by price
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return a.price - b.price;
      });

    return NextResponse.json(
      {
        success: true,
        data: mappedProviders,
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
