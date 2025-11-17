import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ServiceProvider from '@/models/ServiceProvider';
import Homeowner from '@/models/Homeowner';
import ResidentRequest from '@/models/ResidentRequest';

export async function GET() {
  try {
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
      .select('name email services status createdAt');

    const recentHomeowners = await Homeowner.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    const recentRequests = await ResidentRequest.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('homeowner', 'name email')
      .select('title serviceType status priority createdAt');

    // Get service distribution
    const serviceDistribution = await ServiceProvider.aggregate([
      { $unwind: '$services' },
      { $group: { _id: '$services', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get request status distribution
    const requestStatusDistribution = await ResidentRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
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
