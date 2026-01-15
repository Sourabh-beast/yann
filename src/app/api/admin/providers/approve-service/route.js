import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';
import { createAndSendNotification } from '@/lib/notificationHelper';

export async function POST(request) {
  try {
    await connectDB();

    const { providerId, action, rejectionReason } = await request.json();

    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Action must be "approve" or "reject"' },
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

    if (!provider.pendingServiceRequest || !provider.pendingServiceRequest.requestedAt) {
      return NextResponse.json(
        { success: false, message: 'No pending service request found' },
        { status: 400 }
      );
    }

    const { addedServices, addedRates, previousStatus, updateType, removedService, removedRate, previousRate, updatedService } = provider.pendingServiceRequest;

    if (action === 'approve') {
      // Approve: Keep the changes and restore status
      const newStatus = previousStatus === 'pending' ? 'active' : (previousStatus || 'active');

      await ServiceProvider.findByIdAndUpdate(
        providerId,
        {
          status: newStatus,
          $unset: { pendingServiceRequest: 1 }
        },
        { new: true }
      );

      // Send appropriate notification based on update type
      let notificationMessage = '';
      if (updateType === 'rate_update') {
        notificationMessage = `Your pricing update for "${updatedService}" has been approved`;
      } else if (updateType === 'service_removal') {
        notificationMessage = `Your request to remove "${removedService}" has been approved`;
      } else {
        notificationMessage = `Your service request has been approved. Services: ${addedServices.join(', ')}`;
      }

      await createAndSendNotification(
        'service_approved',
        null,
        null,
        providerId,
        {
          title: 'Service Update Approved! 🎉',
          body: notificationMessage,
          updateType: updateType || 'service_addition',
          providerId: providerId
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Service request approved successfully',
        data: {
          newStatus,
          updateType: updateType || 'service_addition'
        }
      });

    } else {
      // Reject: Rollback changes
      const currentServices = provider.services || [];
      const currentRates = provider.serviceRates || [];

      let rolledBackServices = currentServices;
      let rolledBackRates = currentRates;

      if (updateType === 'service_removal' && removedService) {
        // Restore removed service
        rolledBackServices = [...currentServices, removedService];
        if (removedRate) {
          rolledBackRates = [...currentRates, removedRate];
        }
      } else if (updateType === 'rate_update' && previousRate) {
        // Restore previous rate
        const rateIndex = currentRates.findIndex(r => r.serviceName === updatedService);
        if (rateIndex !== -1) {
          rolledBackRates = [...currentRates];
          rolledBackRates[rateIndex] = previousRate;
        }
      } else {
        // Rollback new services
        rolledBackServices = currentServices.filter(s => !addedServices.includes(s));
        const addedServiceNames = addedServices;
        rolledBackRates = currentRates.filter(rate => !addedServiceNames.includes(rate.serviceName));
      }

      await ServiceProvider.findByIdAndUpdate(
        providerId,
        {
          services: rolledBackServices,
          serviceRates: rolledBackRates,
          status: previousStatus || 'active',
          $unset: { pendingServiceRequest: 1 }
        },
        { new: true }
      );

      // Send rejection notification
      await createAndSendNotification(
        'service_rejected',
        null,
        null,
        providerId,
        {
          title: 'Service Update Not Approved',
          body: rejectionReason || 'Your service update request was not approved',
          rejectionReason: rejectionReason,
          updateType: updateType || 'service_addition',
          providerId: providerId
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Service request rejected and changes rolled back',
        data: {
          rejectionReason: rejectionReason || 'Not specified',
          rolledBack: true
        }
      });
    }

  } catch (error) {
    console.error('Error approving service request:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to approve service request' },
      { status: 500 }
    );
  }
}
