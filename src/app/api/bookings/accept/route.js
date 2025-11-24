import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import ResidentRequest from '@/models/ResidentRequest';

export async function POST(request) {
  try {
    await connectDB();

    const { bookingId, providerId, providerName } = await request.json();

    if (!bookingId || !providerId) {
      return NextResponse.json(
        { success: false, message: 'Booking ID and Provider ID are required' },
        { status: 400 }
      );
    }

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if already accepted by someone
    if (booking.status === 'accepted') {
      return NextResponse.json(
        { success: false, message: 'This booking has already been accepted by another provider' },
        { status: 400 }
      );
    }

    // Verify provider exists and offers this service
    const provider = await ServiceProvider.findById(providerId);
    
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    if (!provider.services.includes(booking.serviceName)) {
      return NextResponse.json(
        { success: false, message: 'Provider does not offer this service' },
        { status: 400 }
      );
    }

    // Update booking
    booking.status = 'accepted';
    booking.assignedProvider = providerId;
    booking.providerName = providerName || provider.name;

    if (booking.negotiation && booking.negotiation.isActive) {
      booking.negotiation.isActive = false;
      booking.negotiation.status = 'accepted';
      booking.negotiation.respondedAt = new Date();
    }
    
    // Add to provider responses
    booking.providerResponses.push({
      providerId: providerId,
      response: 'accepted',
      respondedAt: new Date()
    });

    await booking.save();

    if (booking.residentRequest) {
      const requestUpdate = {
        status: 'accepted',
        scheduledFor: booking.bookingDate
      };

      if (booking.negotiation) {
        requestUpdate.negotiation = {
          ...booking.negotiation,
          providerId: booking.negotiation.providerId,
          providerName: booking.negotiation.providerName,
          proposedAmount: booking.negotiation.proposedAmount,
          isActive: false,
          status: booking.negotiation.status,
          updatedAt: new Date()
        };
      }

      await ResidentRequest.findByIdAndUpdate(booking.residentRequest, { $set: requestUpdate });
    }

    // In production: Send confirmation email/SMS to customer
    console.log(`✅ Booking ${bookingId} accepted by ${providerName}`);

    return NextResponse.json({
      success: true,
      message: 'Booking accepted successfully!',
      booking: {
        id: booking._id,
        serviceName: booking.serviceName,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        customerAddress: booking.customerAddress,
        bookingDate: booking.formattedDate,
        bookingTime: booking.bookingTime,
        totalPrice: booking.totalPrice,
        status: booking.status
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Booking acceptance error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to accept booking',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
