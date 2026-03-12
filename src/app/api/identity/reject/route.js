import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import connectDB from '@/lib/connectDB';
import { sendIdentityRejectionNotification } from '@/lib/notifications';

/**
 * POST /api/identity/reject
 * Reject identity verification (Admin only)
 * 
 * Request body:
 * {
 *   userId: string,
 *   userType: 'homeowner' | 'provider',
 *   reason: string,
 *   adminId: string (optional, from token)
 * }
 */
export async function POST(request) {
  try {
    await connectDB();

    const { userId, userType, reason } = await request.json();

    // Validate input
    if (!userId || !userType || !reason) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Add admin authentication check here
    const adminId = 'admin'; // Replace with actual admin ID from token

    console.log('❌ Rejecting identity verification:', { userId, userType, reason, adminId });

    // Get user model
    const Model = userType === 'homeowner' ? Homeowner : ServiceProvider;

    // Update user status
    const updateData = {
      identityVerificationStatus: 'rejected',
      identityRejectedAt: new Date(),
      identityRejectionReason: reason,
      isVerified: false,
    };

    const user = await Model.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`❌ Identity rejected for ${userType}: ${user.name}`);

    // Send push notification to user about rejection
    try {
      await sendIdentityRejectionNotification(userId, userType, user.name, reason);
      console.log('📧 Rejection notification sent to user');
    } catch (notifError) {
      console.error('❌ Failed to send rejection notification:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Identity verification rejected',
      user: {
        id: user._id,
        name: user.name,
        identityVerificationStatus: user.identityVerificationStatus,
        identityRejectedAt: user.identityRejectedAt,
        identityRejectionReason: user.identityRejectionReason,
        isVerified: user.isVerified,
      },
    });

  } catch (error) {
    console.error('❌ Error rejecting identity:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
