import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';

/**
 * POST /api/bookings/update-status
 * Update booking status (in_progress, completed)
 * Used by service providers to manage their jobs
 */
export async function POST(request) {
  try {
    await connectDB();

    const { bookingId, status, providerId } = await request.json();

    if (!bookingId || !status) {
      return NextResponse.json(
        { success: false, message: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
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

    // Verify provider is assigned to this booking (if providerId is passed)
    if (providerId && booking.assignedProvider?.toString() !== providerId) {
      return NextResponse.json(
        { success: false, message: 'You are not assigned to this booking' },
        { status: 403 }
      );
    }

    // Validate status transitions
    const currentStatus = booking.status;
    const validTransitions = {
      'pending': ['accepted', 'cancelled'],
      'accepted': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { success: false, message: `Cannot change status from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }

    // Update the booking status
    booking.status = status;
    
    // Set timestamps based on status
    if (status === 'in_progress') {
      booking.startedAt = new Date();
    } else if (status === 'completed') {
      booking.completedAt = new Date();
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: {
        id: booking._id.toString(),
        status: booking.status,
        serviceName: booking.serviceName,
        customerName: booking.customerName,
        startedAt: booking.startedAt,
        completedAt: booking.completedAt
      }
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update booking status', error: error.message },
      { status: 500 }
    );
  }
}

// Did the changes we needed in status and all stuffs