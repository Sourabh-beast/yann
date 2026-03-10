import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import Homeowner from '@/models/Homeowner';
import { createAndSendNotification } from '@/lib/notificationHelper';

export async function POST(request) {
  try {
    await connectDB();

    // providerName is optional, we'll fetch from DB to be safe
    const { bookingId, providerId } = await request.json();

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

    // Check if already actively processed (accepted or pending_payment)
    if (['accepted', 'pending_payment'].includes(booking.status)) {
      return NextResponse.json(
        { success: false, message: `Booking is already ${booking.status}` },
        { status: 400 }
      );
    }

    // Verify provider exists
    const provider = await ServiceProvider.findById(providerId);

    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    if (!provider.aadhaarVerified) {
      return NextResponse.json(
        { success: false, message: 'You must be Aadhaar verified to accept bookings' },
        { status: 403 }
      );
    }

    // Verify provider offers this service (safety check)
    if (provider.services && !provider.services.includes(booking.serviceName)) {
      // Warn but don't block for admin overrides
      console.warn(`Provider ${provider.name} may not offer ${booking.serviceName}`);
    }

    const now = new Date();

    // ---------------------------------------------------------
    // ACCEPT FLOW (Aligned with respond/route.js)
    // ---------------------------------------------------------

    // Assign provider
    booking.assignedProvider = providerId;
    booking.providerName = provider.name; // Use DB name

    // Update response timer/tracking
    booking.requestTimer = booking.requestTimer || {};
    booking.requestTimer.respondedAt = now;

    // Add to provider responses
    booking.providerResponses.push({
      providerId: providerId,
      response: 'accepted',
      respondedAt: now
    });

    console.log(`✅ Provider ${provider.name} accepting booking ${bookingId} (via Web/Admin)`);
    console.log(`📊 Total price: ₹${booking.totalPrice}`);

    // Set status to 'pending_payment' to wait for customer's 25% initial payment
    booking.status = 'pending_payment';

    // Set 3-minute payment timer
    const paymentExpiresAt = new Date(now.getTime() + 3 * 60 * 1000); // 3 minutes
    booking.paymentTimer = {
      sentAt: now,
      expiresAt: paymentExpiresAt,
      paidAt: null,
      timedOut: false
    };

    // Close any negotiation
    if (booking.negotiation && booking.negotiation.isActive) {
      booking.negotiation.isActive = false;
      booking.negotiation.status = 'accepted'; // Technically accepted by provider, but payment pending
      booking.negotiation.respondedAt = now;
    }

    await booking.save();

    // Calculate 25% initial payment amount
    const initialPaymentAmount = Number((booking.totalPrice * 0.25).toFixed(2));

    // Notify customer to pay 25% initial payment with BUZZER
    const customer = await Homeowner.findById(booking.customerId);

    if (customer?.pushToken) {
      await createAndSendNotification({
        title: '🎉 Booking Accepted!',
        message: `${provider.name} accepted! Pay ₹${initialPaymentAmount} within 3 minutes to confirm.`,
        recipientId: customer._id.toString(),
        recipientType: 'homeowner',
        pushToken: customer.pushToken,
        type: 'payment_required',
        data: {
          recipientId: customer._id.toString(),
          type: 'payment_required',
          bookingId: booking._id.toString(),
          providerName: provider.name,
          providerId: provider._id.toString(),
          serviceName: booking.serviceName,
          requiresPayment: true,
          initialPaymentAmount: initialPaymentAmount,
          totalPrice: booking.totalPrice,
          expiresAt: paymentExpiresAt.toISOString(),
          sound: 'default',
          priority: 'high'
        },
        bookingId: booking._id.toString()
      });
    }

    console.log(`💰 Payment timer set: ₹${initialPaymentAmount} (25%) due in 3 minutes`);

    // Return response indicating payment is required
    return NextResponse.json({
      success: true,
      message: 'Booking accepted successfully. Customer has 3 minutes to complete payment.',
      data: {
        bookingId: booking._id,
        status: 'pending_payment',
        provider: {
          id: provider._id,
          name: provider.name
        },
        requiresPayment: true, // Frontend should check this
        initialPaymentAmount: initialPaymentAmount,
        paymentExpiresAt: paymentExpiresAt.toISOString(),
        remainingSeconds: 180
      }
    });

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