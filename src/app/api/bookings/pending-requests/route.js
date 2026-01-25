import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';

/**
 * GET - Get all pending booking requests for a provider
 * Used when provider opens app to check if there are any active requests
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { success: false, message: 'Provider ID is required' },
        { status: 400 }
      );
    }

    // Find all bookings assigned to this provider that are still awaiting response
    const now = new Date();
    const pendingBookings = await Booking.find({
      assignedProvider: providerId,
      status: 'awaiting_response',
      'requestTimer.expiresAt': { $gt: now }, // Not expired
      'requestTimer.timedOut': { $ne: true } // Not marked as timed out
    })
      .select('serviceName customerName customerAddress customerPhone totalPrice bookingDate bookingTime requestTimer')
      .sort({ 'requestTimer.sentAt': -1 }) // Most recent first
      .lean();

    if (!pendingBookings || pendingBookings.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No pending requests'
      });
    }

    // Calculate remaining time for each request
    const pendingRequests = pendingBookings.map(booking => {
      const expiresAt = new Date(booking.requestTimer.expiresAt);
      const remainingSeconds = Math.max(0, Math.floor((expiresAt - now) / 1000));

      return {
        bookingId: booking._id.toString(),
        serviceName: booking.serviceName,
        customerName: booking.customerName,
        customerAddress: booking.customerAddress,
        customerPhone: booking.customerPhone,
        totalPrice: booking.totalPrice,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        expiresAt: expiresAt.toISOString(),
        remainingSeconds
      };
    });

    console.log(`✅ Found ${pendingRequests.length} pending request(s) for provider ${providerId}`);

    return NextResponse.json({
      success: true,
      data: pendingRequests
    });

  } catch (error) {
    console.error('❌ Error fetching pending requests:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch pending requests' },
      { status: 500 }
    );
  }
}
