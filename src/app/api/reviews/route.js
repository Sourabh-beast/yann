import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Review from '@/models/Review';
import Booking from '@/models/Booking';
import ServiceProvider from '@/models/ServiceProvider';
import Homeowner from '@/models/Homeowner';

const HOMEOWNER_COOKIE = 'yann_session';

/**
 * POST /api/reviews
 * Create a review for a completed booking
 */
export async function POST(request) {
    try {
        await connectDB();

        if (!process.env.JWT_SECRET) {
            return NextResponse.json(
                { success: false, message: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Verify homeowner authentication
        let token = cookies().get(HOMEOWNER_COOKIE)?.value;

        // If no cookie, check Authorization header (for mobile app)
        if (!token) {
            const authHeader = request.headers.get('authorization');
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
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

        // Only reject if audience is explicitly set to something other than homeowner
        // Allow tokens without audience field (mobile app tokens)
        if (decoded?.audience && decoded.audience !== 'homeowner') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized - Homeowner access only' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { bookingId, rating, comment, photos } = body;

        // Validation
        if (!bookingId || !rating) {
            return NextResponse.json(
                { success: false, message: 'Booking ID and rating are required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, message: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Find the booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json(
                { success: false, message: 'Booking not found' },
                { status: 404 }
            );
        }

        // Verify booking belongs to this homeowner
        if (booking.customerId.toString() !== decoded.id) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized - This booking does not belong to you' },
                { status: 403 }
            );
        }

        // Check if booking is completed
        if (booking.status !== 'completed') {
            return NextResponse.json(
                { success: false, message: 'Can only rate completed bookings' },
                { status: 400 }
            );
        }

        // Check if already rated
        if (booking.hasBeenRated) {
            return NextResponse.json(
                { success: false, message: 'This booking has already been rated' },
                { status: 400 }
            );
        }

        // Check if within 30 days
        const daysSinceCompletion = (Date.now() - booking.completedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceCompletion > 30) {
            return NextResponse.json(
                { success: false, message: 'Rating period has expired (30 days)' },
                { status: 400 }
            );
        }

        // Get homeowner details
        const homeowner = await Homeowner.findById(decoded.id);

        // Create review
        const review = await Review.create({
            reviewer: decoded.id,
            reviewerName: homeowner?.name || booking.customerName,
            reviewerPhone: homeowner?.phone || booking.customerPhone,
            provider: booking.assignedProvider,
            providerName: booking.providerName,
            booking: bookingId,
            service: booking.serviceName,
            serviceCategory: booking.serviceCategory,
            rating,
            comment: comment || '',
            isVerifiedPurchase: true,
            status: 'approved'
        });

        // Mark booking as rated
        booking.hasBeenRated = true;
        await booking.save();

        // Update provider's rating
        const provider = await ServiceProvider.findById(booking.assignedProvider);
        if (provider) {
            const reviews = await Review.find({ provider: provider._id, status: 'approved' });
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = totalRating / reviews.length;

            provider.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
            provider.totalReviews = reviews.length;
            await provider.save();

            console.log(`Updated provider ${provider.name} rating: ${provider.rating} (${provider.totalReviews} reviews)`);
        }

        return NextResponse.json({
            success: true,
            message: 'Review submitted successfully',
            data: {
                reviewId: review._id,
                rating: review.rating,
                providerRating: provider?.rating,
                providerTotalReviews: provider?.totalReviews
            }
        });

    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to submit review' },
            { status: 500 }
        );
    }
}
