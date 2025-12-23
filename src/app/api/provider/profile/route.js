import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

const PROVIDER_COOKIE = 'yann_session';

/**
 * GET /api/provider/profile
 * Get the authenticated provider's own profile
 */
export async function GET() {
  try {
    await connectDB();

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const token = cookies().get(PROVIDER_COOKIE)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Session expired - Please login again' },
        { status: 401 }
      );
    }

    if (decoded?.audience !== 'provider') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Provider access only' },
        { status: 401 }
      );
    }

    const provider = await ServiceProvider.findById(decoded.id);
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: {
        id: provider._id.toString(),
        _id: provider._id.toString(),
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        profileImage: provider.profileImage || '',
        experience: provider.experience,
        services: provider.services || [],
        serviceRates: provider.serviceRates || [],
        selectedCategories: provider.selectedCategories || [],
        workingHours: provider.workingHours || null,
        status: provider.status,
        rating: provider.rating || 0,
        totalReviews: provider.totalReviews || 0,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching provider profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/provider/profile
 * Update the authenticated provider's profile
 */
export async function PUT(request) {
  return handleProfileUpdate(request);
}

/**
 * PATCH /api/provider/profile
 * Update the authenticated provider's profile (partial update)
 */
export async function PATCH(request) {
  return handleProfileUpdate(request);
}

async function handleProfileUpdate(request) {
  try {
    await connectDB();

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const token = cookies().get(PROVIDER_COOKIE)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Session expired - Please login again' },
        { status: 401 }
      );
    }

    if (decoded?.audience !== 'provider') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Provider access only' },
        { status: 401 }
      );
    }

    const provider = await ServiceProvider.findById(decoded.id);
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const allowedUpdates = ['name', 'phone', 'profileImage', 'experience', 'workingHours', 'bio', 'serviceRates'];
    
    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        provider[field] = body[field];
      }
    }

    await provider.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      provider: {
        id: provider._id.toString(),
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        profileImage: provider.profileImage || '',
        experience: provider.experience,
        bio: provider.bio || '',
        serviceRates: provider.serviceRates || [],
        workingHours: provider.workingHours || null,
        status: provider.status
      }
    });

  } catch (error) {
    console.error('Error updating provider profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
