import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import Booking from '@/models/Booking'; // Optional: if we want to cancel bookings or check logic

const TOKEN_COOKIE_NAME = "yann_session"; // Provider cookie
const HOME_COOKIE_NAME = "yann_home_session"; // Homeowner cookie

// Helper to get authenticated user
const getAuthenticatedUser = async () => {
    const cookieStore = await cookies();
    let token = cookieStore.get(TOKEN_COOKIE_NAME)?.value || cookieStore.get(HOME_COOKIE_NAME)?.value;

    // If no cookie, try Authorization header (for mobile)
    if (!token) {
        const headersList = await headers();
        const authHeader = headersList.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return { userId: null, decoded: null };
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT secret is not configured");
        return { userId: null, decoded: null };
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return { userId: decoded.id || decoded._id, decoded };
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return { userId: null, decoded: null };
    }
};

export async function DELETE(request) {
    try {
        await connectDB();

        const { userId, decoded } = await getAuthenticatedUser();

        if (!userId || !decoded) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Determine user type from audience claim in token
        const userType = decoded.audience; // 'homeowner' or 'provider'

        if (!userType || !['homeowner', 'provider'].includes(userType)) {
            // Fallback: Try to find in both collections if audience is missing (unlikely with valid token)
            console.warn('⚠️ Token missing audience, attempting to find user in collections...');
        }

        console.log(`🗑️ Deleting account for ${userType || 'user'} ID: ${userId}`);

        let deletedUser = null;

        if (userType === 'provider') {
            deletedUser = await ServiceProvider.findByIdAndDelete(userId);
        } else if (userType === 'homeowner') {
            deletedUser = await Homeowner.findByIdAndDelete(userId);
        } else {
            // Emergency fallback
            deletedUser = await Homeowner.findByIdAndDelete(userId);
            if (!deletedUser) {
                deletedUser = await ServiceProvider.findByIdAndDelete(userId);
            }
        }

        if (!deletedUser) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Clear cookies
        const response = NextResponse.json({
            success: true,
            message: 'Account deleted successfully'
        });

        response.cookies.delete(TOKEN_COOKIE_NAME);
        response.cookies.delete(HOME_COOKIE_NAME);

        console.log(`✅ Account deleted successfully: ${userId}`);

        return response;

    } catch (error) {
        console.error('Account deletion error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to delete account', error: error.message },
            { status: 500 }
        );
    }
}
