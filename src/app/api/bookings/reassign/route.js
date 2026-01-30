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

    // Recalculate Price based on new provider's rates
    const serviceName = booking.serviceName;

    // 1. Get new rate
    let newRate = 0;
    if (provider.serviceRates && Array.isArray(provider.serviceRates)) {
      const rateEntry = provider.serviceRates.find(r =>
        r.serviceName?.trim().toLowerCase() === serviceName?.trim().toLowerCase()
      );
      if (rateEntry) newRate = Number(rateEntry.price) || 0;
    }

    // Fallback logic if specific service rate not found
    if (!newRate && provider.serviceRates?.length > 0) {
      newRate = Number(provider.serviceRates[0].price) || 0;
    }

    // If still 0, try to maintain old price or use a default? 
    // Ideally we should have a price. If 0, it might mean free or error.
    // For now, if we found a new rate, we update. If not, we keep the old one (fallback safe).

    if (newRate > 0) {
      // Calculate GST and Total
      // Use existing GST percentage from booking breakdown if available, else default to 18%
      const gstPercentage = booking.pricingBreakdown?.gstPercentage || 18;
      const gstRate = gstPercentage / 100;

      const newBasePrice = newRate;
      const newGstAmount = newBasePrice * gstRate;
      const newTotalPrice = newBasePrice + newGstAmount;

      // Update Booking Fields
      booking.basePrice = newBasePrice;
      booking.totalPrice = Math.round(newTotalPrice * 100) / 100; // Round to 2 decimals

      // Update Breakdown
      booking.pricingBreakdown = {
        ...booking.pricingBreakdown,
        baseCost: newBasePrice,
        gst: Math.round(newGstAmount * 100) / 100,
        subtotal: newBasePrice,
        total: Math.round(newTotalPrice * 100) / 100
      };

      console.log(`💰 Price updated for provider ${provider.name}: ${newBasePrice} + GST = ${booking.totalPrice}`);
    } else {
      console.log(`⚠️ No specific rate found for ${serviceName} with provider ${provider.name}. Keeping original price: ${booking.totalPrice}`);
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
