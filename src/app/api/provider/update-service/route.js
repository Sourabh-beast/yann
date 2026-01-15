import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * PUT /api/provider/update-service
 * Update pricing for existing services (requires admin approval)
 */
export async function PUT(request) {
  try {
    await connectDB();

    const { providerId, serviceName, price, hourlyRate, billingType } = await request.json();

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

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json(
        { success: false, message: 'Price must be a valid positive number' },
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

    // Find the existing rate
    const existingRateIndex = provider.serviceRates.findIndex(
      rate => rate.serviceName === serviceName
    );

    if (existingRateIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Service rate not found' },
        { status: 404 }
      );
    }

    const existingRate = provider.serviceRates[existingRateIndex];
    const previousStatus = provider.status;

    // Prepare updated rate
    const updatedRate = {
      serviceName,
      price: price !== undefined ? price : existingRate.price,
      hourlyRate: hourlyRate !== undefined ? hourlyRate : existingRate.hourlyRate,
      billingType: billingType || existingRate.billingType || 'fixed'
    };

    // Update the rate in the array
    const updatedRates = [...provider.serviceRates];
    updatedRates[existingRateIndex] = updatedRate;

    // Store update request for admin approval
    await ServiceProvider.findByIdAndUpdate(
      providerId,
      {
        serviceRates: updatedRates,
        status: 'pending', // Set to pending for admin review
        $set: {
          pendingServiceRequest: {
            addedServices: [], // No new services added
            addedRates: [updatedRate], // Updated rate
            previousStatus: previousStatus,
            requestedAt: new Date(),
            updateType: 'rate_update',
            updatedService: serviceName,
            previousRate: existingRate
          }
        }
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Service rate update submitted for admin approval',
      data: {
        serviceName,
        updatedRate,
        previousRate: existingRate
      }
    });

  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update service' },
      { status: 500 }
    );
  }
}
