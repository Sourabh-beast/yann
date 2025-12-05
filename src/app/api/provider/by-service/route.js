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
    
    // More flexible matching - match partial service names
    // e.g., "Drivers" should match "Driver", "Full-Day Personal Driver", etc.
    const baseServiceName = normalizedService
      .replace(/s$/i, '')  // Remove trailing 's' (Drivers -> Driver)
      .replace(/ies$/i, 'y'); // Babies -> Baby
    
    // Match if provider's service contains the base name (case insensitive)
    const serviceRegex = new RegExp(escapeRegex(baseServiceName), 'i');

    console.log(`🔍 Searching providers for: "${normalizedService}" (regex: ${serviceRegex})`);

    const providers = await ServiceProvider.find({
      services: { $regex: serviceRegex },
      status: 'active'
    }).select('name experience rating totalReviews serviceRates workingHours profileImage services');

    console.log(`📋 Found ${providers.length} providers matching "${normalizedService}"`);
    
    // Log provider services for debugging
    providers.forEach(p => {
      console.log(`  - ${p.name}: services = [${p.services?.join(', ')}]`);
    });

    const mappedProviders = providers
      .map((provider) => {
        // Find price - try exact match first, then partial match
        let price = null;
        
        if (provider.serviceRates && Array.isArray(provider.serviceRates)) {
          // Try exact match
          const exactMatch = provider.serviceRates.find(
            (rate) => rate.serviceName?.trim().toLowerCase() === normalizedService.toLowerCase()
          );
          
          if (exactMatch) {
            price = exactMatch.price;
          } else {
            // Try partial match
            const partialMatch = provider.serviceRates.find(
              (rate) => rate.serviceName?.toLowerCase().includes(baseServiceName.toLowerCase()) ||
                       baseServiceName.toLowerCase().includes(rate.serviceName?.toLowerCase() || '')
            );
            if (partialMatch) {
              price = partialMatch.price;
            }
          }
        }
        
        // If still no price, use a default or first available rate
        if (price === null && provider.serviceRates?.length > 0) {
          price = provider.serviceRates[0].price;
        }

        // Include provider even without price (price can be negotiated)
        return {
          id: provider._id.toString(),
          name: provider.name,
          experience: provider.experience,
          rating: provider.rating || 0,
          totalReviews: provider.totalReviews || 0,
          price: price || 0,
          workingHours: provider.workingHours || null,
          profileImage: provider.profileImage || '',
          services: provider.services || []
        };
      })
      .sort((a, b) => (a.price || 999999) - (b.price || 999999));

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
