import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';

const HOMEOWNER_COOKIE = 'yann_session';

/**
 * GET /api/reviews/pending
 * Get all completed bookings that can be rated by the authenticated homeowner
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

        // Verify homeowner authentication
        const cookieStore = await cookies();
        const token = cookieStore.get(HOMEOWNER_COOKIE)?.value;
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

        if (decoded?.audience !== 'homeowner') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized - Homeowner access only' },
                { status: 403 }
            );
        }

        // Calculate date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Find completed bookings that haven't been rated yet and are within 30 days
        const pendingRatings = await Booking.find({
            customerId: decoded.id,
            status: 'completed',
            hasBeenRated: false,
            completedAt: { $gte: thirtyDaysAgo }
        })
            .sort({ completedAt: -1 })
            .select('serviceName providerName assignedProvider completedAt bookingDate totalPrice serviceCategory')
            .limit(20);

        return NextResponse.json({
            success: true,
            data: pendingRatings.map(booking => ({
                bookingId: booking._id,
                serviceName: booking.serviceName,
                serviceCategory: booking.serviceCategory,
                providerName: booking.providerName,
                providerId: booking.assignedProvider,
                completedAt: booking.completedAt,
                bookingDate: booking.bookingDate,
                totalPrice: booking.totalPrice,
                daysRemaining: Math.ceil(30 - (Date.now() - booking.completedAt.getTime()) / (1000 * 60 * 60 * 24))
            }))
        });

    } catch (error) {
        console.error('Error fetching pending ratings:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch pending ratings' },
            { status: 500 }
        );
    }
}
