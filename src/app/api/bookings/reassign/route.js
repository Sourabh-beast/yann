import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * POST /api/bookings/reassign
 * Reassign a rejected booking to a new provider
 */
export async function POST(request) {
  try {
    await connectDB();

    const { bookingId, newProviderId } = await request.json();

    if (!bookingId || !newProviderId) {
      return NextResponse.json(
        { success: false, message: 'Missing bookingId or newProviderId' },
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

    // Verify booking is in rejected state
    if (booking.status !== 'rejected') {
      return NextResponse.json(
        { success: false, message: 'Only rejected bookings can be reassigned' },
        { status: 400 }
      );
    }

    // Find the new provider
    const provider = await ServiceProvider.findById(newProviderId);
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    // Update booking with new provider and reset status
    booking.assignedProvider = newProviderId;
    booking.providerId = newProviderId;
    booking.providerName = provider.name;
    booking.status = 'awaiting_response';
    
    // Clear the request timer to allow a fresh request
    booking.requestTimer = {
      sentAt: null,
      expiresAt: null,
      respondedAt: null,
      timedOut: false,
      buzzerCount: 0,
      lastBuzzerAt: null
    };

    await booking.save();

    console.log(`✅ Booking ${bookingId} reassigned to provider ${provider.name}`);

    return NextResponse.json({
      success: true,
      message: 'Booking reassigned successfully',
      data: {
        bookingId: booking._id,
        providerId: provider._id,
        providerName: provider.name,
        status: booking.status
      }
    });

  } catch (error) {
    console.error('❌ Error reassigning booking:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reassign booking', error: error.message },
      { status: 500 }
    );
  }
}
