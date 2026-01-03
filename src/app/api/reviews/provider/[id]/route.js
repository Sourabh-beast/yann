import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Review from '@/models/Review';

/**
 * GET /api/reviews/provider/[id]
 * Get all reviews for a specific provider
 */
export async function GET(request, { params }) {
    try {
        await connectDB();

        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Provider ID is required' },
                { status: 400 }
            );
        }

        // Get all approved reviews for this provider
        const reviews = await Review.find({
            provider: id,
            status: 'approved'
        })
            .sort({ createdAt: -1 })
            .select('rating comment reviewerName createdAt isVerifiedPurchase helpfulCount providerResponse')
            .limit(50); // Limit to 50 most recent reviews

        // Calculate rating distribution
        const ratingDistribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        };

        reviews.forEach(review => {
            ratingDistribution[review.rating]++;
        });

        // Calculate average rating
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

        return NextResponse.json({
            success: true,
            data: {
                reviews: reviews.map(r => ({
                    id: r._id,
                    rating: r.rating,
                    comment: r.comment,
                    reviewerName: r.reviewerName,
                    createdAt: r.createdAt,
                    isVerifiedPurchase: r.isVerifiedPurchase,
                    helpfulCount: r.helpfulCount,
                    providerResponse: r.providerResponse
                })),
                stats: {
                    totalReviews: reviews.length,
                    averageRating: Math.round(avgRating * 10) / 10,
                    ratingDistribution
                }
            }
        });

    } catch (error) {
        console.error('Error fetching provider reviews:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}
