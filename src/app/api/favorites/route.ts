/**
 * Favorites API Route
 * 
 * GET /api/favorites - Get user's favorites
 * POST /api/favorites - Add to favorites
 * DELETE /api/favorites/:providerId - Remove from favorites
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// GET - Get user's favorites
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Verify authentication
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Get user with favorites populated
        const user = await User.findById(decoded.userId)
            .populate({
                path: 'favorites',
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
            data: user.favorites || [],
        });
    } catch (error: any) {
        console.error('Get favorites error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to get favorites' },
            { status: 500 }
        );
    }
}

// POST - Add to favorites
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        // Verify authentication
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const { providerId } = await req.json();

        if (!providerId) {
            return NextResponse.json(
                { success: false, message: 'Provider ID is required' },
                { status: 400 }
            );
        }

        // Get user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Initialize favorites array if it doesn't exist
        if (!user.favorites) {
            user.favorites = [];
        }

        // Check if already favorited
        const alreadyFavorited = user.favorites.some(
            (fav: any) => fav.toString() === providerId
        );

        if (alreadyFavorited) {
            return NextResponse.json({
                success: true,
                message: 'Already in favorites',
                data: user.favorites,
            });
        }

        // Add to favorites
        user.favorites.push(providerId);
        await user.save();

        // Populate and return
        await user.populate({
            path: 'favorites',
            select: 'name email profileImage avatar rating services experience totalReviews',
        });

        return NextResponse.json({
            success: true,
            message: 'Added to favorites',
            data: user.favorites,
        });
    } catch (error: any) {
        console.error('Add to favorites error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to add to favorites' },
            { status: 500 }
        );
    }
}

// DELETE - Remove from favorites
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();

        // Verify authentication
        const token = req.headers.get('authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        // Get providerId from URL
        const url = new URL(req.url);
        const providerId = url.pathname.split('/').pop();

        if (!providerId) {
            return NextResponse.json(
                { success: false, message: 'Provider ID is required' },
                { status: 400 }
            );
        }

        // Get user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        // Remove from favorites
        if (user.favorites) {
            user.favorites = user.favorites.filter(
                (fav: any) => fav.toString() !== providerId
            );
            await user.save();
        }

        // Populate and return
        await user.populate({
            path: 'favorites',
            select: 'name email profileImage avatar rating services experience totalReviews',
        });

        return NextResponse.json({
            success: true,
            message: 'Removed from favorites',
            data: user.favorites,
        });
    } catch (error: any) {
        console.error('Remove from favorites error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to remove from favorites' },
            { status: 500 }
        );
    }
}
