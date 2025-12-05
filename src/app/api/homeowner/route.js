import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';

const HOME_COOKIE = 'yann_home_session';

const sanitizeHomeowner = (homeowner) => ({
  id: homeowner._id.toString(),
  name: homeowner.name,
  email: homeowner.email,
  phone: homeowner.phone || '',
  avatar: homeowner.avatar || '',
  preferences: homeowner.preferences || [],
  savedProviders: homeowner.savedProviders || [],
  addressBook: homeowner.addressBook || [],
  createdAt: homeowner.createdAt,
  lastLoginAt: homeowner.lastLoginAt,
});

/**
 * GET /api/homeowner
 * Get current authenticated homeowner
 * Same as /api/homeowner/me but for convenience
 */
export async function GET() {
  try {
    await connectDB();

    const token = cookies().get(HOME_COOKIE)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Session expired' },
        { status: 401 }
      );
    }

    if (decoded?.audience !== 'homeowner') {
      return NextResponse.json(
        { success: false, message: 'Invalid session scope' },
        { status: 401 }
      );
    }

    const homeowner = await Homeowner.findOne({ email: decoded.email });
    if (!homeowner) {
      return NextResponse.json(
        { success: false, message: 'Resident not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sanitizeHomeowner(homeowner),
    });
  } catch (error) {
    console.error('Error fetching homeowner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch homeowner' },
      { status: 500 }
    );
  }
}
