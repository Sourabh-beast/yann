import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * POST /api/admin/service-requests/approve
 * Approve a provider's service request
 * Requires admin authentication
 */
export async function POST(request) {
  try {
    await connectDB();

    const { providerId } = await request.json();

    // Validate input
    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // TODO: Add admin authentication check
    // const isAdmin = await verifyAdminToken(request);
    // if (!isAdmin) {
    //   return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    // }

    // Find the provider
    const provider = await ServiceProvider.findById(providerId);

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check if there's a pending request
    if (!provider.pendingServiceRequest?.requestedAt) {
      return NextResponse.json(
        { success: false, message: 'No pending service request found' },
        { status: 400 }
      );
    }

    // Approve the request: set status to active and clear pending request
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      providerId,
      {
        status: 'active',
        $set: {
          'pendingServiceRequest.addedServices': [],
          'pendingServiceRequest.addedRates': [],
          'pendingServiceRequest.previousStatus': null,
          'pendingServiceRequest.requestedAt': null
        }
      },
      { new: true }
    );

    console.log('✅ Service request approved for provider:', provider.name);

    return NextResponse.json({
      success: true,
      message: `Service request approved for ${provider.name}`,
      data: {
        providerId: updatedProvider._id,
        providerName: updatedProvider.name,
        status: updatedProvider.status,
        services: updatedProvider.services,
        serviceRates: updatedProvider.serviceRates
      }
    });

  } catch (error) {
    console.error('Error approving service request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to approve service request' },
      { status: 500 }
    );
  }
}
