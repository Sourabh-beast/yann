import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import ResidentRequest from '@/models/ResidentRequest';

export async function POST(request) {
  try {
    await connectDB();

    const { bookingId, providerId, providerName, proposedAmount, note } = await request.json();

    if (!bookingId || !providerId || proposedAmount === undefined) {
      return NextResponse.json(
        { success: false, message: 'Booking, provider and proposed amount are required' },
        { status: 400 }
      );
    }

    const normalizedAmount = Number(proposedAmount);
    if (Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid proposed amount' },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    if (['accepted', 'completed', 'cancelled'].includes(booking.status)) {
      return NextResponse.json(
        { success: false, message: 'Negotiation is not allowed for this booking state' },
        { status: 400 }
      );
    }

    const provider = await ServiceProvider.findById(providerId);
    if (!provider) {
      return NextResponse.json({ success: false, message: 'Provider not found' }, { status: 404 });
    }

    if (!provider.services.includes(booking.serviceName)) {
      return NextResponse.json(
        { success: false, message: 'Provider does not offer this service' },
        { status: 400 }
      );
    }

    const timestamp = new Date();
    const negotiationHistoryEntry = {
      proposedAmount: normalizedAmount,
      providerId,
      providerName: providerName || provider.name,
      note: (note || '').slice(0, 300),
      status: 'pending',
      createdAt: timestamp
    };

    booking.negotiation = {
      isActive: true,
      proposedAmount: normalizedAmount,
      providerId,
      providerName: providerName || provider.name,
      note: (note || '').slice(0, 300),
      status: 'pending',
      createdAt: timestamp,
      respondedAt: null,
      history: [...(booking.negotiation?.history || []), negotiationHistoryEntry]
    };

    await booking.save();

    if (booking.residentRequest) {
      await ResidentRequest.findByIdAndUpdate(booking.residentRequest, {
        $set: {
          negotiation: {
            isActive: true,
            proposedAmount: normalizedAmount,
            providerId,
            providerName: providerName || provider.name,
            note: (note || '').slice(0, 300),
            status: 'pending',
            updatedAt: timestamp
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      negotiation: {
        proposedAmount: normalizedAmount,
        providerId,
        providerName: providerName || provider.name,
        note: (note || '').slice(0, 300),
        status: 'pending',
        createdAt: timestamp
      }
    });
  } catch (error) {
    console.error('Negotiation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to record negotiation',
        error: error.message
      },
      { status: 500 }
    );
  }
}
