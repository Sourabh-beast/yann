import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import ResidentRequest from '@/models/ResidentRequest';

export async function POST(request) {
  try {
    await connectDB();

    const { bookingId, providerId, reason } = await request.json();

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

    // Add to provider responses
    booking.providerResponses.push({
      providerId: providerId,
      response: 'rejected',
      respondedAt: new Date(),
      rejectionReason: reason || 'Not specified'
    });

    await booking.save();

    // Check if all providers have rejected
    const allProviders = await ServiceProvider.find({
      services: booking.serviceName,
      status: 'active'
    });

    const rejectedCount = booking.providerResponses.filter(r => r.response === 'rejected').length;
    
    if (rejectedCount >= allProviders.length) {
      booking.status = 'rejected';
      if (booking.negotiation && booking.negotiation.isActive) {
        booking.negotiation.isActive = false;
        booking.negotiation.status = 'declined';
        booking.negotiation.respondedAt = new Date();
      }
      await booking.save();

      if (booking.residentRequest) {
        const requestUpdate = { status: 'denied' };
        if (booking.negotiation) {
          requestUpdate.negotiation = {
            ...booking.negotiation,
            isActive: false,
            status: 'declined',
            updatedAt: new Date()
          };
        }
        await ResidentRequest.findByIdAndUpdate(booking.residentRequest, { $set: requestUpdate });
      }
      
      // In production: Notify customer that booking couldn't be fulfilled
      console.log(`❌ All providers rejected booking ${bookingId}`);
    }

    console.log(`⏭️ Provider rejected booking ${bookingId}. Reason: ${reason || 'Not specified'}`);

    return NextResponse.json({
      success: true,
      message: 'Booking rejected. It will be offered to other providers.',
      booking: {
        id: booking._id,
        status: booking.status
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Booking rejection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to reject booking',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
