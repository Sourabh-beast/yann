import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';
import Homeowner from '@/models/Homeowner';
import ResidentRequest from '@/models/ResidentRequest';
import { getOrSetCache } from '@/lib/cache';

const ADMIN_STATS_CACHE_KEY = 'cache:admin:stats';
const ADMIN_STATS_CACHE_TTL_SECONDS = 5 * 60; // matches existing CDN s-maxage=300

export async function GET() {
  try {
    const data = await getOrSetCache(ADMIN_STATS_CACHE_KEY, ADMIN_STATS_CACHE_TTL_SECONDS, async () => {
      await connectDB();

      // Get total counts
      const [
        totalProviders,
        activeProviders,
        pendingProviders,
        totalHomeowners,
        totalRequests,
        pendingRequests,
        completedRequests
      ] = await Promise.all([
        ServiceProvider.countDocuments(),
        ServiceProvider.countDocuments({ status: 'active' }),
        ServiceProvider.countDocuments({ status: 'pending' }),
        Homeowner.countDocuments(),
        ResidentRequest.countDocuments(),
        ResidentRequest.countDocuments({ status: 'pending' }),
        ResidentRequest.countDocuments({ status: 'completed' })
      ]);

      // Get recent activity
      const recentProviders = await ServiceProvider.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email services status createdAt')
        .lean();

      const recentHomeowners = await Homeowner.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt')
        .lean();

      const recentRequests = await ResidentRequest.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('homeowner', 'name email')
        .select('title serviceType status priority createdAt')
        .lean();

      // Get service distribution
      const serviceDistribution = await ServiceProvider.aggregate([
        { $unwind: '$services' },
        { $group: { _id: '$services', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).option({ maxTimeMS: 5000 });

      // Get request status distribution
      const requestStatusDistribution = await ResidentRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).option({ maxTimeMS: 5000 });

      return {
        overview: {
          totalProviders,
          activeProviders,
          pendingProviders,
          totalHomeowners,
          totalRequests,
          pendingRequests,
          completedRequests
        },
        recentActivity: {
          providers: recentProviders,
          homeowners: recentHomeowners,
          requests: recentRequests
        },
        charts: {
          serviceDistribution,
          requestStatusDistribution
        }
      };
    });

    return NextResponse.json({
      success: true,
      data
    }, {
      headers: {
        'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'private, max-age=300',
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
