import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import JobSession from '@/models/JobSession';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import Homeowner from '@/models/Homeowner';

/**
 * POST /api/job/start-otp
 * Generate start OTP for customer when provider clicks "Start Job"
 */
export async function POST(request) {
  try {
    await dbConnect();

    const { bookingId, providerId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { success: false, message: 'Booking ID is required' },
        { status: 400 }
      );
    }

    // Find booking
    const booking = await Booking.findById(bookingId)
      .populate('customerId')
      .populate('assignedProvider');

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify booking is accepted
    if (booking.status !== 'accepted') {
      return NextResponse.json(
        { success: false, message: 'Booking must be accepted before starting job' },
        { status: 400 }
      );
    }

    // Verify provider is assigned
    if (!booking.assignedProvider || booking.assignedProvider._id.toString() !== providerId) {
      return NextResponse.json(
        { success: false, message: 'You are not assigned to this booking' },
        { status: 403 }
      );
    }

    // Check if job session already exists
    let jobSession = await JobSession.findOne({ booking: bookingId });

    if (jobSession && jobSession.status !== 'pending_start') {
      return NextResponse.json(
        { success: false, message: 'Job has already been started' },
        { status: 400 }
      );
    }

    // Get provider's working hours for expected duration
    const provider = await ServiceProvider.findById(providerId);
    const expectedDuration = provider.workingHours 
      ? calculateExpectedDuration(provider.workingHours)
      : 480; // Default 8 hours

    // Get base hourly rate from booking
    const baseHourlyRate = booking.totalPrice / (expectedDuration / 60);
    const overtimeRate = baseHourlyRate * 1.5;

    if (!jobSession) {
      // Create new job session
      jobSession = new JobSession({
        booking: bookingId,
        provider: providerId,
        customer: booking.customerId,
        expectedDuration,
        baseHourlyRate,
        overtimeRate,
        status: 'pending_start'
      });
    }

    // Generate start OTP
    const { otp, hash } = jobSession.generateOTP();
    jobSession.startOTP = hash;
    jobSession.startOTPPlain = otp; // Store plain for customer display
    jobSession.startOTPExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    jobSession.startOTPVerified = false;

    await jobSession.save();

    // Update booking with job session reference
    booking.jobSession = jobSession._id;
    await booking.save();

    return NextResponse.json({
      success: true,
      message: 'Start OTP generated successfully',
      data: {
        jobSessionId: jobSession._id,
        otp, // Send plain OTP to customer
        expiresIn: 300, // 5 minutes in seconds
        customerName: booking.customerName,
        customerPhone: booking.customerPhone
      }
    });

  } catch (error) {
    console.error('Error generating start OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate start OTP', error: error.message },
      { status: 500 }
    );
  }
}

// Helper function to calculate expected duration
function calculateExpectedDuration(workingHours) {
  if (!workingHours || !workingHours.startTime || !workingHours.endTime) {
    return 480; // Default 8 hours
  }

  const [startHours, startMinutes] = workingHours.startTime.split(':').map(Number);
  const [endHours, endMinutes] = workingHours.endTime.split(':').map(Number);

  const startInMinutes = startHours * 60 + startMinutes;
  const endInMinutes = endHours * 60 + endMinutes;

  return endInMinutes - startInMinutes;
}
