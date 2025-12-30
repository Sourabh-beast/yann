import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import JobSession from '@/models/JobSession';
import Booking from '@/models/Booking';

/**
 * POST /api/job/end-otp
 * Generate end OTP for customer when provider clicks "End Job"
 */
export async function POST(request) {
  try {
    await dbConnect();

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

    // Verify job is in progress
    if (jobSession.status !== 'in_progress') {
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

    // Generate end OTP
    const { otp, hash } = jobSession.generateOTP();
    jobSession.endOTP = hash;
    jobSession.endOTPPlain = otp; // Store plain for customer display
    jobSession.endOTPExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    jobSession.endOTPVerified = false;
    jobSession.status = 'pending_end';

    await jobSession.save();

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
