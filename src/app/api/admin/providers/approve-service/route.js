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

    // Restore previous status (or set to active if was pending originally)
    const newStatus = provider.pendingServiceRequest.previousStatus === 'pending' 
      ? 'active' 
      : (provider.pendingServiceRequest.previousStatus || 'active');

    // Clear the pending request and update status
    const updatedProvider = await ServiceProvider.findByIdAndUpdate(
      providerId,
      {
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
      message: 'Service request approved successfully. Provider status restored.',
      data: updatedProvider
    });

  } catch (error) {
    console.error('Error approving service request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to approve service request' },
      { status: 500 }
    );
  }
}
