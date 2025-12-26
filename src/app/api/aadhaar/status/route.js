import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import connectDB from '@/lib/connectDB';

const HOMEOWNER_COOKIE = 'homeowner_token';
const PROVIDER_COOKIE = 'provider_token';

/**
 * GET /api/aadhaar/status
 * Check Aadhaar verification status for current user
 */
export async function GET(request) {
  try {
    await connectDB();

    // Get user from token
    const headersList = headers();
    const userId = headersList.get('x-user-id');
    
    let user = null;
    let userType = null;

    // Try homeowner cookie
    const homeownerToken = cookies().get(HOMEOWNER_COOKIE)?.value;
    if (homeownerToken && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(homeownerToken, process.env.JWT_SECRET);
        user = await Homeowner.findById(decoded.id || decoded.userId);
        if (user) userType = 'homeowner';
      } catch (err) {
        console.log('Homeowner token invalid');
      }
    }

    // Try provider cookie
    if (!user) {
      const providerToken = cookies().get(PROVIDER_COOKIE)?.value;
      if (providerToken && process.env.JWT_SECRET) {
        try {
          const decoded = jwt.verify(providerToken, process.env.JWT_SECRET);
          user = await ServiceProvider.findById(decoded.id || decoded.userId);
          if (user) userType = 'provider';
        } catch (err) {
          console.log('Provider token invalid');
        }
      }
    }

    // Try x-user-id header (mobile app)
    if (!user && userId) {
      user = await Homeowner.findById(userId);
      if (user) {
        userType = 'homeowner';
      } else {
        user = await ServiceProvider.findById(userId);
        if (user) userType = 'provider';
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return verification status
    const response = {
      success: true,
      data: {
        userType,
        aadhaarVerified: user.aadhaarVerified || false,
        aadhaarPhone: user.aadhaarPhone || null,
        aadhaarVerifiedAt: user.aadhaarVerifiedAt || null,
      },
    };

    // Add admin approval status for providers
    if (userType === 'provider') {
      response.data.adminApproved = user.adminApproved || false;
      response.data.adminApprovedAt = user.adminApprovedAt || null;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error checking Aadhaar status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
