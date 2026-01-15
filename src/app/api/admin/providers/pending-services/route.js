import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * GET /api/admin/providers/pending-services
 * Get all providers with pending service update requests
 */
export async function GET() {
  try {
    await connectDB();

    // Find providers with pending service requests
    const providersWithPendingRequests = await ServiceProvider.find({
      'pendingServiceRequest.requestedAt': { $ne: null }
    }).select('name email phone services serviceRates pendingServiceRequest status');

    // Format the response
    const formattedRequests = providersWithPendingRequests.map(provider => {
      const request = provider.pendingServiceRequest;
      
      return {
        providerId: provider._id,
        providerName: provider.name,
        providerEmail: provider.email,
        providerPhone: provider.phone,
        currentServices: provider.services,
        currentStatus: provider.status,
        requestType: request.updateType || 'service_addition',
        requestedAt: request.requestedAt,
        details: {
          addedServices: request.addedServices || [],
          addedRates: request.addedRates || [],
          updatedService: request.updatedService,
          previousRate: request.previousRate,
          removedService: request.removedService,
          removedRate: request.removedRate
        }
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        pendingRequests: formattedRequests,
        count: formattedRequests.length
      }
    });

  } catch (error) {
    console.error('Error fetching pending service requests:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch pending requests' },
      { status: 500 }
    );
  }
}
