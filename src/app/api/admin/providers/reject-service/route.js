import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

export async function POST(request) {
  try {
    await connectDB();

    const { providerId } = await request.json();

    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Find the provider
    const provider = await ServiceProvider.findById(providerId);

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    if (!provider.pendingServiceRequest || !provider.pendingServiceRequest.addedServices || provider.pendingServiceRequest.addedServices.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No pending service request found' },
        { status: 400 }
      );
    }

    const { addedServices, addedRates, previousStatus } = provider.pendingServiceRequest;

    // Remove the rejected services from provider's services list
    const existingServices = provider.services || [];
    const existingRates = provider.serviceRates || [];

    // Filter out the rejected services
    const updatedServices = existingServices.filter(s => !addedServices.includes(s));
    const updatedRates = existingRates.filter(r => !addedServices.includes(r.serviceName));

    // Restore previous status (or set to active if was pending originally)
    const newStatus = previousStatus === 'pending' 
      ? 'active' 
      : (previousStatus || 'active');

    // Update provider: remove rejected services and clear pending request
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      providerId,
      {
        services: updatedServices,
        serviceRates: updatedRates,
        status: newStatus,
        pendingServiceRequest: {
          addedServices: [],
          addedRates: [],
          previousStatus: null,
          requestedAt: null
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Service request rejected. Services have been removed and provider status restored.',
      data: updatedProvider
    });

  } catch (error) {
    console.error('Error rejecting service request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to reject service request' },
      { status: 500 }
    );
  }
}
