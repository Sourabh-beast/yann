import { NextResponse } from 'next/server';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import { connectDB } from '@/lib/mongodb';

/**
 * POST /api/aadhaar/webhook
 * Webhook endpoint to receive verification results from Meon DigiLocker
 * 
 * Meon will send verification result here after user completes OTP
 */
export async function POST(request) {
  try {
    await connectDB();

    const payload = await request.json();
    console.log('📥 Received Meon webhook:', JSON.stringify(payload, null, 2));

    // Extract data from Meon webhook payload
    const {
      client_ref_id,
      status,
      data,
      request_id,
    } = payload;

    if (!client_ref_id) {
      return NextResponse.json(
        { success: false, message: 'Missing client_ref_id' },
        { status: 400 }
      );
    }

    // Parse client_ref_id: format is "userType_userId_timestamp"
    const [userType, userId] = client_ref_id.split('_');

    if (!userType || !userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid client_ref_id format' },
        { status: 400 }
      );
    }

    // Check verification status
    if (status !== 'completed' && status !== 'success') {
      console.log(`⚠️ Verification not successful: ${status}`);
      return NextResponse.json({
        success: true,
        message: 'Verification status received',
      });
    }

    // Extract Aadhaar data
    const aadhaarData = data?.aadhaar || data;
    const phoneNumber = aadhaarData?.mobile || aadhaarData?.phone;

    // Update user model based on type
    const Model = userType === 'homeowner' ? Homeowner : ServiceProvider;
    
    const updateData = {
      aadhaarVerified: true,
      aadhaarVerifiedAt: new Date(),
      ...(phoneNumber && { aadhaarPhone: phoneNumber }),
    };

    const updatedUser = await Model.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      console.error(`❌ User not found: ${userType} ${userId}`);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Aadhaar verified for ${userType}: ${updatedUser.name}`);

    // For providers, send notification about admin approval requirement
    if (userType === 'provider') {
      console.log('📧 Provider verified - awaiting admin approval');
      // TODO: Send notification to admin panel
      // TODO: Send notification to provider about pending approval
    }

    return NextResponse.json({
      success: true,
      message: 'Verification completed successfully',
    });

  } catch (error) {
    console.error('❌ Error processing Aadhaar webhook:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
