/**
 * Delete Favorite API Route
 * 
 * DELETE /api/favorites/[providerId]
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { providerId: string } }
) {
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

        const { providerId } = params;

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
