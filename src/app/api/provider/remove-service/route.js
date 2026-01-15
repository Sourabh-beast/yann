import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * DELETE /api/provider/remove-service
 * Remove a service from provider's list (requires admin approval)
 */
export async function DELETE(request) {
  try {
    await connectDB();

    const { providerId, serviceName } = await request.json();

    // Validate input
    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      );
    }

    if (!serviceName) {
      return NextResponse.json(
        { success: false, message: 'Service name is required' },
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

    // Check if service exists
    if (!provider.services.includes(serviceName)) {
      return NextResponse.json(
        { success: false, message: 'Service not found in provider\'s service list' },
        { status: 404 }
      );
    }

    // Check if this is the only service
    if (provider.services.length === 1) {
      return NextResponse.json(
        { success: false, message: 'Cannot remove the last service. Provider must have at least one service.' },
        { status: 400 }
      );
    }

    const previousStatus = provider.status;

    // Store the current state before removal
    const serviceToRemove = serviceName;
    const rateToRemove = provider.serviceRates.find(rate => rate.serviceName === serviceName);

    // Remove service and its rate (temporarily, pending approval)
    const updatedServices = provider.services.filter(s => s !== serviceName);
    const updatedRates = provider.serviceRates.filter(rate => rate.serviceName !== serviceName);

    // Store removal request for admin approval
    await ServiceProvider.findByIdAndUpdate(
      providerId,
      {
        services: updatedServices,
        serviceRates: updatedRates,
        status: 'pending', // Set to pending for admin review
        $set: {
          pendingServiceRequest: {
            addedServices: [], // No new services
            addedRates: [],
            previousStatus: previousStatus,
            requestedAt: new Date(),
            updateType: 'service_removal',
            removedService: serviceToRemove,
            removedRate: rateToRemove
          }
        }
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Service removal request submitted for admin approval',
      data: {
        removedService: serviceToRemove,
        remainingServices: updatedServices
      }
    });

  } catch (error) {
    console.error('Error removing service:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to remove service' },
      { status: 500 }
    );
  }
}
