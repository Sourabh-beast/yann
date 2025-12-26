import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * GET /api/admin/service-requests
 * Get all providers with pending service requests
 * Requires admin authentication
 */
export async function GET(request) {
  try {
    await connectDB();

    // TODO: Add admin authentication check
    // const isAdmin = await verifyAdminToken(request);
    // if (!isAdmin) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    // }

    // Find all providers with pending service requests
    const providersWithRequests = await ServiceProvider.find({
      'pendingServiceRequest.requestedAt': { $ne: null }
    }).select('name email phone pendingServiceRequest services serviceRates status');

    // Format the response
    const formattedRequests = providersWithRequests.map(provider => ({
      providerId: provider._id,
      providerName: provider.name,
      providerEmail: provider.email,
      providerPhone: provider.phone,
      currentServices: provider.services || [],
      currentRates: provider.serviceRates || [],
      addedServices: provider.pendingServiceRequest?.addedServices || [],
      addedRates: provider.pendingServiceRequest?.addedRates || [],
      previousStatus: provider.pendingServiceRequest?.previousStatus,
      currentStatus: provider.status,
      requestedAt: provider.pendingServiceRequest?.requestedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedRequests,
      count: formattedRequests.length
    });

  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch service requests' },
      { status: 500 }
    );
  }
}
