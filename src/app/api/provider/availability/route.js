import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

// Removed force-dynamic — cookies() already makes route dynamic in Next.js 14+

const PROVIDER_COOKIE = 'yann_session';

const getTokenFromRequest = async (request) => {
  const cookieStore = await cookies();
  let token = cookieStore.get(PROVIDER_COOKIE)?.value;

  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  return token;
};

export async function PATCH(request) {
  try {
    await connectDB();

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const token = await getTokenFromRequest(request);
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

    const body = await request.json();
    const isOnline = body?.isOnline;

    if (typeof isOnline !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isOnline must be a boolean' },
        { status: 400 }
      );
    }

    const provider = await ServiceProvider.findById(decoded.id);
    if (!provider) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    if (provider.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Provider must be approved before updating availability' },
        { status: 403 }
      );
    }

    provider.isOnline = isOnline;
    await provider.save();

    return NextResponse.json({
      success: true,
      message: `Provider is now ${isOnline ? 'online' : 'offline'}`,
      isOnline: provider.isOnline,
      status: provider.status
    });
  } catch (error) {
    console.error('Error updating provider availability:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update availability' },
      { status: 500 }
    );
  }
}
