import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import connectDB from '@/lib/connectDB';
import { sendIdentityApprovalNotification } from '@/lib/notifications';

/**
 * POST /api/identity/approve
 * Approve identity verification (Admin only)
 * 
 * Request body:
 * {
 *   userId: string,
 *   userType: 'homeowner' | 'provider',
 *   adminId: string (optional, from token)
 * }
 */
export async function POST(request) {
  try {
    await connectDB();

    const { userId, userType } = await request.json();

    // Validate input
    if (!userId || !userType) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Add admin authentication check here
    // For now, we'll allow the request
    const adminId = 'admin'; // Replace with actual admin ID from token

    console.log('✅ Approving identity verification:', { userId, userType, adminId });

    // Get user model
    const Model = userType === 'homeowner' ? Homeowner : ServiceProvider;

    // Update user status
    const updateData = {
      identityVerificationStatus: 'approved',
      identityApprovedAt: new Date(),
      identityApprovedBy: adminId,
      isVerified: true,
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

    console.log(`✅ Identity approved for ${userType}: ${user.name}`);

    // Send push notification to user about approval
    try {
      await sendIdentityApprovalNotification(userId, userType, user.name);
      console.log('📧 Approval notification sent to user');
    } catch (notifError) {
      console.error('❌ Failed to send approval notification:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Identity verification approved',
      user: {
        id: user._id,
        name: user.name,
        identityVerificationStatus: user.identityVerificationStatus,
        identityApprovedAt: user.identityApprovedAt,
        isVerified: user.isVerified,
      },
    });

  } catch (error) {
    console.error('❌ Error approving identity:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
