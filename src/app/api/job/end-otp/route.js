import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import JobSession from '@/models/JobSession';
import Booking from '@/models/Booking';
import Homeowner from '@/models/Homeowner';
import { createAndSendNotification } from '@/lib/notificationHelper';

/**
 * POST /api/job/end-otp
 * Generate end OTP for customer when provider clicks "End Job"
 */
export async function POST(request) {
  try {
    await connectDB();

    const { jobSessionId, providerId } = await request.json();

    if (!jobSessionId) {
      return NextResponse.json(
        { success: false, message: 'Job session ID is required' },
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

    // Verify job is in progress or pending end (retry)
    if (jobSession.status !== 'in_progress' && jobSession.status !== 'pending_end') {
      return NextResponse.json(
        { success: false, message: 'Job is not in progress' },
        { status: 400 }
      );
    }

    // Check if already completed
    if (jobSession.endOTPVerified) {
      return NextResponse.json(
        { success: false, message: 'Job has already been completed' },
        { status: 400 }
      );
    }

    // Calculate current duration
    const currentDuration = Math.floor((Date.now() - jobSession.startTime) / (1000 * 60));

    let otp, hash;

    // Reuse existing OTP if valid and status is pending_end
    if (jobSession.status === 'pending_end' && jobSession.endOTPPlain && jobSession.endOTPExpiry > new Date()) {
      otp = jobSession.endOTPPlain;
      // hash is already stored in jobSession.endOTP
    } else {
      // Generate NEW end OTP
      const generated = jobSession.generateOTP();
      otp = generated.otp;
      hash = generated.hash;

      jobSession.endOTP = hash;
      jobSession.endOTPPlain = otp; // Store plain for customer display
      jobSession.endOTPExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      jobSession.endOTPVerified = false;
      jobSession.status = 'pending_end';

      await jobSession.save();
    }

    // Send persistent notification to member with end OTP
    const booking = await Booking.findById(jobSession.booking);
    const homeowner = await Homeowner.findById(jobSession.customer);

    if (homeowner) {
      await createAndSendNotification({
        title: '🔐 Job Completion OTP',
        message: `${booking.providerName || 'Provider'} has finished the job. Share OTP to complete: ${otp}`,
        recipientId: jobSession.customer.toString(),
        recipientType: 'homeowner',
        pushToken: homeowner.pushToken,
        type: 'otp_end',
        data: {
          type: 'job_end_otp',
          otp: otp,
          bookingId: booking._id.toString(),
          otpType: 'end'
        },
        bookingId: booking._id.toString()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'End OTP generated successfully',
      data: {
        otp, // Send plain OTP to customer
        expiresIn: 300, // 5 minutes in seconds
        currentDuration,
        expectedDuration: jobSession.expectedDuration
      }
    });

  } catch (error) {
    console.error('Error generating end OTP:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate end OTP', error: error.message },
      { status: 500 }
    );
  }
}
