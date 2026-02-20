import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

// Removed force-dynamic — cookies() already makes route dynamic in Next.js 14+

const PROVIDER_COOKIE = 'yann_session';

/**
 * GET /api/provider/profile
 * Get the authenticated provider's own profile
 */
export async function GET(request) {
  try {
    await connectDB();

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Try to get token from cookie first (for web)
    const cookieStore = await cookies();
    let token = cookieStore.get(PROVIDER_COOKIE)?.value;

    // If no cookie, try Authorization header (for mobile)
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

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

    // Return both avatar and profileImage for consistency
    const avatarUrl = provider.avatar || provider.profileImage || '';
    const profileImageUrl = provider.profileImage || provider.avatar || '';

    return NextResponse.json({
      success: true,
      provider: {
        id: provider._id.toString(),
        _id: provider._id.toString(),
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        avatar: avatarUrl,
        profileImage: profileImageUrl,
        experience: provider.experience,
        services: provider.services || [],
        driverServiceDetails: provider.driverServiceDetails || null,
        serviceRates: provider.serviceRates || [],
        selectedCategories: provider.selectedCategories || [],
        workingHours: provider.workingHours || null,
        status: provider.status,
        isOnline: provider.isOnline ?? true,
        rating: provider.rating || 0,
        totalReviews: provider.totalReviews || 0,
        bio: provider.bio || '',
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

    // Try to get token from cookie first (for web)
    const cookieStore = await cookies();
    let token = cookieStore.get(PROVIDER_COOKIE)?.value;

    // If no cookie, try Authorization header (for mobile)
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

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
    console.log('📥 Received profile update request:', body);

    // Added 'status' and 'services' to enable availability toggle from mobile app
    const allowedUpdates = ['name', 'phone', 'profileImage', 'experience', 'workingHours', 'bio', 'serviceRates', 'status', 'services', 'driverServiceDetails'];

    for (const field of allowedUpdates) {
      if (body[field] !== undefined) {
        console.log(`  ✏️ Updating ${field}:`, body[field]);
        provider[field] = body[field];
      }
    }

    await provider.save();
    console.log('💾 Provider saved successfully. Bio:', provider.bio);

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
        services: provider.services || [],
        driverServiceDetails: provider.driverServiceDetails || null,
        workingHours: provider.workingHours || null,
        status: provider.status,
        isOnline: provider.isOnline ?? true
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
