/**
 * Favorites API Route
 * 
 * GET /api/favorites - Get user's favorites
 * POST /api/favorites - Add to favorites
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';

const HOME_COOKIE = 'yann_home_session';

// GET - Get user's favorites
export async function GET(request) {
    try {
        await connectDB();

        // Verify authentication
        if (!process.env.JWT_SECRET) {
            return NextResponse.json(
                { success: false, message: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Support both cookie-based (website) and token-based (mobile app) authentication
        let token = cookies().get(HOME_COOKIE)?.value;

        // If no cookie, check Authorization header (for mobile app)
        if (!token) {
            const authHeader = request.headers.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.userId) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Get user with favorites populated
        const user = await Homeowner.findById(decoded.userId)
            .populate({
                path: 'savedProviders',
                select: 'name email profileImage avatar rating services experience totalReviews',
            });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user.savedProviders || [],
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get favorites' },
            { status: 500 }
        );
    }
}

// POST - Add to favorites
export async function POST(request) {
    try {
        await connectDB();

        // Verify authentication
        if (!process.env.JWT_SECRET) {
            return NextResponse.json(
                { success: false, message: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Support both cookie-based and token-based authentication
        let token = cookies().get(HOME_COOKIE)?.value;

        if (!token) {
            const authHeader = request.headers.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded?.userId) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const { providerId } = await request.json();

        if (!providerId) {
            return NextResponse.json(
                { success: false, message: 'Provider ID is required' },
                { status: 400 }
            );
        }

        // Get user
        const user = await Homeowner.findById(decoded.userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Initialize savedProviders array if it doesn't exist
        if (!user.savedProviders) {
            user.savedProviders = [];
        }

        // Check if already favorited
        const alreadyFavorited = user.savedProviders.some(
            (fav) => fav.toString() === providerId
        );

        if (alreadyFavorited) {
            return NextResponse.json({
                success: true,
                message: 'Already in favorites',
                data: user.savedProviders,
            });
        }

        // Add to favorites
        user.savedProviders.push(providerId);
        await user.save();

        // Populate and return
        await user.populate({
            path: 'savedProviders',
            select: 'name email profileImage avatar rating services experience totalReviews',
        });

        return NextResponse.json({
            success: true,
            message: 'Added to favorites',
            data: user.savedProviders,
        });
    } catch (error) {
        console.error('Add to favorites error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to add to favorites' },
            { status: 500 }
        );
    }
}
