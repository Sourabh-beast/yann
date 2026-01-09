/**
 * Delete Favorite API Route
 * 
 * DELETE /api/favorites/[providerId]
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Homeowner from '@/models/Homeowner';

const HOME_COOKIE = 'yann_home_session';

export async function DELETE(request, { params }) {
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

        const { providerId } = params;

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

        // Remove from favorites
        if (user.savedProviders) {
            user.savedProviders = user.savedProviders.filter(
                (fav) => fav.toString() !== providerId
            );
            await user.save();
        }

        // Populate and return
        await user.populate({
            path: 'savedProviders',
            select: 'name email profileImage avatar rating services experience totalReviews',
        });

        return NextResponse.json({
            success: true,
            message: 'Removed from favorites',
            data: user.savedProviders,
        });
    } catch (error) {
        console.error('Remove from favorites error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to remove from favorites' },
            { status: 500 }
        );
    }
}
