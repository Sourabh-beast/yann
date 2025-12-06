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
          prices: { $push: '$serviceRates' },
        },
      },
      // Add a stage to find min/max prices for each service
      {
        $addFields: {
          allPrices: {
            $reduce: {
              input: '$prices',
              initialValue: [],
              in: {
                $concatArrays: [
                  '$$value',
                  {
                    $map: {
                      input: '$$this',
                      as: 'rate',
                      in: {
                        $cond: [
                          { $eq: ['$$rate.serviceName', '$_id'] },
                          '$$rate.price',
                          null
                        ]
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $addFields: {
          validPrices: {
            $filter: {
              input: '$allPrices',
              as: 'price',
              cond: { $and: [{ $ne: ['$$price', null] }, { $gt: ['$$price', 0] }] }
            }
          }
        }
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
          minPrice: { $min: '$validPrices' },
          maxPrice: { $max: '$validPrices' },
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
