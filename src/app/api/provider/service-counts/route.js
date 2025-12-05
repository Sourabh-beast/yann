import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';

/**
 * GET /api/provider/service-counts
 * Returns provider counts grouped by service using MongoDB aggregation
 */
export async function GET() {
  try {
    await connectDB();

    // Aggregate providers by service
    const serviceCounts = await ServiceProvider.aggregate([
      // Only count active providers
      { $match: { status: 'active' } },
      // Unwind the services array to count each service separately
      { $unwind: '$services' },
      // Group by service name and count providers
      {
        $group: {
          _id: '$services',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          minPrice: { $min: { $arrayElemAt: ['$serviceRates.price', 0] } },
        },
      },
      // Sort by count (most popular first)
      { $sort: { count: -1 } },
      // Reshape the output
      {
        $project: {
          _id: 0,
          service: '$_id',
          providerCount: '$count',
          avgRating: { $round: ['$avgRating', 1] },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: serviceCounts,
    });
  } catch (error) {
    console.error('Error fetching service counts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service counts', data: [] },
      { status: 500 }
    );
  }
}
