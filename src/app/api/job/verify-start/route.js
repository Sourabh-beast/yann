import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import JobSession from '@/models/JobSession';
import Booking from '@/models/Booking';
import Homeowner from '@/models/Homeowner';
import { createAndSendNotification } from '@/lib/notificationHelper';

/**
 * POST /api/job/verify-start
 * Verify start OTP entered by provider and start timer
 */
export async function POST(request) {
  try {
    await connectDB();

    const { jobSessionId, otp, providerId } = await request.json();

    if (!jobSessionId || !otp) {
      return NextResponse.json(
        { success: false, message: 'Job session ID and OTP are required' },
        { status: 400 }
      );
    }

    // Find job session
    const jobSession = await JobSession.findById(jobSessionId).populate('booking');

    if (!jobSession) {
      return NextResponse.json(
        { success: false, message: 'Job session not found' },
        { status: 404 }
      );
    }

    // Verify provider
    if (jobSession.provider.toString() !== providerId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Check if already verified
    if (jobSession.startOTPVerified) {
      return NextResponse.json(
        { success: false, message: 'Job has already been started' },
        { status: 400 }
      );
    }

    // Check OTP expiry
    if (new Date() > jobSession.startOTPExpiry) {
      return NextResponse.json(
        { success: false, message: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValid = jobSession.verifyOTP(otp, jobSession.startOTP);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // Start the job
    jobSession.startOTPVerified = true;
    jobSession.startOTPPlain = null; // Clear plain OTP for security
    jobSession.startTime = new Date();
    jobSession.status = 'in_progress';
    await jobSession.save();

    // Update booking status
    const booking = await Booking.findById(jobSession.booking);
    booking.status = 'in_progress';
    booking.startedAt = jobSession.startTime;
    await booking.save();

    // Notify customer that job has started
    const homeowner = await Homeowner.findById(jobSession.customer);
    if (homeowner) {
        await createAndSendNotification({
            title: '▶️ Job Started',
            message: `The job ${booking.serviceName} has started.`,
            recipientId: jobSession.customer.toString(),
            recipientType: 'homeowner',
            pushToken: homeowner.pushToken,
            type: 'job_started',
            data: { bookingId: booking._id.toString() },
            bookingId: booking._id.toString()
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Job started successfully',
      data: {
        startTime: jobSession.startTime,
        expectedDuration: jobSession.expectedDuration,
        status: jobSession.status
      }
    });

  } catch (error) {
    console.error('Error verifying start OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify OTP', error: error.message },
      { status: 500 }
    );
  }
}
