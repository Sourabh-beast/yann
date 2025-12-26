import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * POST /api/user/push-token
 * Save or update user's push notification token
 */
export async function POST(request) {
  try {
    await connectDB();

    const { pushToken, userType } = await request.json();

    // Validate input
    if (!pushToken) {
      return NextResponse.json(
        { success: false, message: 'Push token is required' },
        { status: 400 }
      );
    }

    if (!userType || !['homeowner', 'provider'].includes(userType)) {
      return NextResponse.json(
        { success: false, message: 'Valid user type is required (homeowner or provider)' },
        { status: 400 }
      );
    }

    // Get user ID from headers (set by auth middleware)
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Update the appropriate model
    const Model = userType === 'homeowner' ? Homeowner : ServiceProvider;
    
    const user = await Model.findByIdAndUpdate(
      userId,
      { pushToken },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Push token saved for ${userType}:`, userId);

    return NextResponse.json({
      success: true,
      message: 'Push token saved successfully',
    });

  } catch (error) {
    console.error('Error saving push token:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to save push token' },
      { status: 500 }
    );
  }
}
