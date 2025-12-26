import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';
import { sendServiceRejectionNotification } from '@/lib/sendPushNotification';

/**
 * POST /api/admin/service-requests/reject
 * Reject a provider's service request and revert changes
 * Requires admin authentication
 */
export async function POST(request) {
  try {
    await connectDB();

    const { providerId, reason } = await request.json();

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

    // Get the services and rates that were added
    const addedServices = provider.pendingServiceRequest.addedServices || [];
    const addedRates = provider.pendingServiceRequest.addedRates || [];
    const previousStatus = provider.pendingServiceRequest.previousStatus || 'active';

    // Remove the added services and rates
    const updatedServices = (provider.services || []).filter(
      service => !addedServices.includes(service)
    );

    const addedServiceNames = addedRates.map(r => r.serviceName);
    const updatedRates = (provider.serviceRates || []).filter(
      rate => !addedServiceNames.includes(rate.serviceName)
    );

    // Reject the request: remove added services, restore previous status, clear pending request
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      providerId,
      {
        services: updatedServices,
        serviceRates: updatedRates,
        status: previousStatus,
        $set: {
          'pendingServiceRequest.addedServices': [],
          'pendingServiceRequest.addedRates': [],
          'pendingServiceRequest.previousStatus': null,
          'pendingServiceRequest.requestedAt': null
        }
      },
      { new: true }
    );

    console.log('❌ Service request rejected for provider:', provider.name, reason ? `Reason: ${reason}` : '');

    // Send push notification to provider
    if (updatedProvider.pushToken && updatedProvider.pushNotificationsEnabled) {
      try {
        await sendServiceRejectionNotification(updatedProvider.pushToken, updatedProvider.name, reason);
        console.log('📬 Rejection notification sent to provider');
      } catch (error) {
        console.error('❌ Failed to send notification:', error);
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Service request rejected for ${provider.name}`,
      data: {
        providerId: updatedProvider._id,
        providerName: updatedProvider.name,
        status: updatedProvider.status,
        services: updatedProvider.services,
        serviceRates: updatedProvider.serviceRates,
        rejectionReason: reason || 'No reason provided'
      }
    });

  } catch (error) {
    console.error('Error rejecting service request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reject service request' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/service-requests/reject
 * Reject a provider's service request and revert changes
 * Requires admin authentication
 */
export async function POST(request) {
  try {
    await connectDB();

    const { providerId, reason } = await request.json();

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

    // Get the services and rates that were added
    const addedServices = provider.pendingServiceRequest.addedServices || [];
    const addedRates = provider.pendingServiceRequest.addedRates || [];
    const previousStatus = provider.pendingServiceRequest.previousStatus || 'active';

    // Remove the added services and rates
    const updatedServices = (provider.services || []).filter(
      service => !addedServices.includes(service)
    );

    const addedServiceNames = addedRates.map(r => r.serviceName);
    const updatedRates = (provider.serviceRates || []).filter(
      rate => !addedServiceNames.includes(rate.serviceName)
    );

    // Reject the request: remove added services, restore previous status, clear pending request
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      providerId,
      {
        services: updatedServices,
        serviceRates: updatedRates,
        status: previousStatus,
        $set: {
          'pendingServiceRequest.addedServices': [],
          'pendingServiceRequest.addedRates': [],
          'pendingServiceRequest.previousStatus': null,
          'pendingServiceRequest.requestedAt': null
        }
      },
      { new: true }
    );

    console.log('❌ Service request rejected for provider:', provider.name, reason ? `Reason: ${reason}` : '');

    return NextResponse.json({
      success: true,
      message: `Service request rejected for ${provider.name}`,
      data: {
        providerId: updatedProvider._id,
        providerName: updatedProvider.name,
        status: updatedProvider.status,
        services: updatedProvider.services,
        serviceRates: updatedProvider.serviceRates,
        rejectionReason: reason || 'No reason provided'
      }
    });

  } catch (error) {
    console.error('Error rejecting service request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reject service request' },
      { status: 500 }
    );
  }
}
