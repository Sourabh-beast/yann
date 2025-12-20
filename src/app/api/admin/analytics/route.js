import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Booking from '@/models/Booking';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';
import Transaction from '@/models/Transaction';
import Review from '@/models/Review';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const period = searchParams.get('period') || '30days';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      switch (period) {
        case '7days':
          dateFilter = { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) };
          break;
        case '30days':
          dateFilter = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
          break;
        case '90days':
          dateFilter = { $gte: new Date(now - 90 * 24 * 60 * 60 * 1000) };
          break;
        case '1year':
          dateFilter = { $gte: new Date(now - 365 * 24 * 60 * 60 * 1000) };
          break;
        case 'all':
          dateFilter = {};
          break;
        default:
          dateFilter = { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) };
      }
    }

    let data = {};

    switch (type) {
      case 'overview':
        data = await getOverviewAnalytics(dateFilter);
        break;
      case 'revenue':
        data = await getRevenueAnalytics(dateFilter, period);
        break;
      case 'users':
        data = await getUserGrowthAnalytics(dateFilter, period);
        break;
      case 'services':
        data = await getServicePopularityAnalytics(dateFilter);
        break;
      case 'providers':
        data = await getProviderPerformanceAnalytics(dateFilter);
        break;
      case 'comparison':
        data = await getComparisonAnalytics();
        break;
      default:
        data = await getOverviewAnalytics(dateFilter);
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getOverviewAnalytics(dateFilter) {
  const [
    totalBookings,
    completedBookings,
    pendingBookings,
    cancelledBookings,
    totalProviders,
    activeProviders,
    totalHomeowners,
    activeHomeowners,
    revenueResult,
    avgRatingResult
  ] = await Promise.all([
    Booking.countDocuments(dateFilter.createdAt ? { createdAt: dateFilter } : {}),
    Booking.countDocuments({ status: 'completed', ...(dateFilter.createdAt ? { createdAt: dateFilter } : {}) }),
    Booking.countDocuments({ status: { $in: ['pending', 'confirmed'] }, ...(dateFilter.createdAt ? { createdAt: dateFilter } : {}) }),
    Booking.countDocuments({ status: 'cancelled', ...(dateFilter.createdAt ? { createdAt: dateFilter } : {}) }),
    ServiceProvider.countDocuments(),
    ServiceProvider.countDocuments({ status: 'active', isBlocked: { $ne: true } }),
    Homeowner.countDocuments(),
    Homeowner.countDocuments({ isBlocked: { $ne: true } }),
    Transaction.aggregate([
      { $match: { status: 'completed', type: 'payment', ...(dateFilter.$gte ? { createdAt: dateFilter } : {}) } },
      { $group: { _id: null, total: { $sum: '$amount' }, commission: { $sum: '$commissionAmount' } } }
    ]),
    Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ])
  ]);

  const revenue = revenueResult[0] || { total: 0, commission: 0 };
  const ratings = avgRatingResult[0] || { avgRating: 0, totalReviews: 0 };

  return {
    bookings: {
      total: totalBookings,
      completed: completedBookings,
      pending: pendingBookings,
      cancelled: cancelledBookings,
      completionRate: totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0
    },
    users: {
      totalProviders,
      activeProviders,
      totalHomeowners,
      activeHomeowners
    },
    revenue: {
      total: revenue.total,
      commission: revenue.commission,
      netRevenue: revenue.total - revenue.commission
    },
    ratings: {
      average: ratings.avgRating?.toFixed(1) || 0,
      total: ratings.totalReviews
    }
  };
}

async function getRevenueAnalytics(dateFilter, period) {
  // Group by appropriate interval based on period
  let groupFormat;
  switch (period) {
    case '7days':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case '30days':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case '90days':
      groupFormat = { $dateToString: { format: '%Y-%U', date: '$createdAt' } }; // Weekly
      break;
    case '1year':
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } }; // Monthly
      break;
    default:
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }

  const revenueByPeriod = await Transaction.aggregate([
    { 
      $match: { 
        status: 'completed', 
        type: 'payment',
        ...(dateFilter.$gte ? { createdAt: dateFilter } : {})
      } 
    },
    {
      $group: {
        _id: groupFormat,
        revenue: { $sum: '$amount' },
        commission: { $sum: '$commissionAmount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const revenueByCategory = await Transaction.aggregate([
    { 
      $match: { 
        status: 'completed', 
        type: 'payment',
        ...(dateFilter.$gte ? { createdAt: dateFilter } : {})
      } 
    },
    {
      $group: {
        _id: '$serviceCategory',
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  const revenueByPaymentMethod = await Transaction.aggregate([
    { 
      $match: { 
        status: 'completed', 
        type: 'payment',
        ...(dateFilter.$gte ? { createdAt: dateFilter } : {})
      } 
    },
    {
      $group: {
        _id: '$paymentMethod',
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    trend: revenueByPeriod.map(item => ({
      date: item._id,
      revenue: item.revenue,
      commission: item.commission,
      transactions: item.count
    })),
    byCategory: revenueByCategory.map(item => ({
      category: item._id || 'Uncategorized',
      revenue: item.revenue,
      bookings: item.count
    })),
    byPaymentMethod: revenueByPaymentMethod.map(item => ({
      method: item._id || 'Unknown',
      revenue: item.revenue,
      count: item.count
    }))
  };
}

async function getUserGrowthAnalytics(dateFilter, period) {
  let groupFormat;
  switch (period) {
    case '7days':
    case '30days':
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
      break;
    case '90days':
      groupFormat = { $dateToString: { format: '%Y-%U', date: '$createdAt' } };
      break;
    case '1year':
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
      break;
    default:
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }

  const [providerGrowth, homeownerGrowth] = await Promise.all([
    ServiceProvider.aggregate([
      { $match: dateFilter.$gte ? { createdAt: dateFilter } : {} },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    Homeowner.aggregate([
      { $match: dateFilter.$gte ? { createdAt: dateFilter } : {} },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  // Merge data for combined view
  const allDates = new Set([
    ...providerGrowth.map(p => p._id),
    ...homeownerGrowth.map(h => h._id)
  ]);

  const combinedGrowth = Array.from(allDates).sort().map(date => {
    const providerData = providerGrowth.find(p => p._id === date);
    const homeownerData = homeownerGrowth.find(h => h._id === date);
    return {
      date,
      providers: providerData?.count || 0,
      homeowners: homeownerData?.count || 0,
      total: (providerData?.count || 0) + (homeownerData?.count || 0)
    };
  });

  // Calculate cumulative totals
  let cumulativeProviders = 0;
  let cumulativeHomeowners = 0;
  const cumulativeGrowth = combinedGrowth.map(item => {
    cumulativeProviders += item.providers;
    cumulativeHomeowners += item.homeowners;
    return {
      ...item,
      cumulativeProviders,
      cumulativeHomeowners,
      cumulativeTotal: cumulativeProviders + cumulativeHomeowners
    };
  });

  return {
    trend: cumulativeGrowth,
    summary: {
      newProviders: providerGrowth.reduce((sum, p) => sum + p.count, 0),
      newHomeowners: homeownerGrowth.reduce((sum, h) => sum + h.count, 0)
    }
  };
}

async function getServicePopularityAnalytics(dateFilter) {
  const serviceBookings = await Booking.aggregate([
    { $match: dateFilter.$gte ? { createdAt: dateFilter } : {} },
    {
      $group: {
        _id: '$service',
        bookings: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        revenue: { $sum: '$amount' }
      }
    },
    { $sort: { bookings: -1 } },
    { $limit: 10 }
  ]);

  const serviceRatings = await Review.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: '$service',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  // Merge ratings with bookings
  const servicesWithRatings = serviceBookings.map(service => {
    const ratingData = serviceRatings.find(r => r._id === service._id);
    return {
      service: service._id || 'Unknown',
      bookings: service.bookings,
      completed: service.completed,
      revenue: service.revenue,
      completionRate: service.bookings > 0 ? ((service.completed / service.bookings) * 100).toFixed(1) : 0,
      avgRating: ratingData?.avgRating?.toFixed(1) || 'N/A',
      reviewCount: ratingData?.reviewCount || 0
    };
  });

  return {
    services: servicesWithRatings,
    topService: servicesWithRatings[0] || null
  };
}

async function getProviderPerformanceAnalytics(dateFilter) {
  const topProviders = await Booking.aggregate([
    { 
      $match: { 
        status: 'completed',
        ...(dateFilter.$gte ? { createdAt: dateFilter } : {})
      } 
    },
    {
      $group: {
        _id: '$provider',
        completedBookings: { $sum: 1 },
        totalRevenue: { $sum: '$amount' }
      }
    },
    { $sort: { completedBookings: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'serviceproviders',
        localField: '_id',
        foreignField: '_id',
        as: 'providerInfo'
      }
    },
    { $unwind: { path: '$providerInfo', preserveNullAndEmptyArrays: true } }
  ]);

  // Get ratings for top providers
  const providerIds = topProviders.map(p => p._id);
  const providerRatings = await Review.aggregate([
    { $match: { provider: { $in: providerIds }, status: 'approved' } },
    {
      $group: {
        _id: '$provider',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const providersWithRatings = topProviders.map(provider => {
    const ratingData = providerRatings.find(r => r._id?.toString() === provider._id?.toString());
    return {
      id: provider._id,
      name: provider.providerInfo?.fullName || 'Unknown Provider',
      phone: provider.providerInfo?.phone,
      service: provider.providerInfo?.services?.[0] || 'N/A',
      completedBookings: provider.completedBookings,
      totalRevenue: provider.totalRevenue,
      avgRating: ratingData?.avgRating?.toFixed(1) || 'N/A',
      reviewCount: ratingData?.reviewCount || 0
    };
  });

  return {
    topProviders: providersWithRatings
  };
}

async function getComparisonAnalytics() {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const thisYear = new Date(now.getFullYear(), 0, 1);
  const lastYear = new Date(now.getFullYear() - 1, 0, 1);
  const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);

  const [
    thisMonthBookings,
    lastMonthBookings,
    thisMonthRevenue,
    lastMonthRevenue,
    thisYearBookings,
    lastYearBookings,
    thisYearRevenue,
    lastYearRevenue,
    thisMonthUsers,
    lastMonthUsers
  ] = await Promise.all([
    Booking.countDocuments({ createdAt: { $gte: thisMonth } }),
    Booking.countDocuments({ createdAt: { $gte: lastMonth, $lte: lastMonthEnd } }),
    Transaction.aggregate([
      { $match: { status: 'completed', type: 'payment', createdAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Transaction.aggregate([
      { $match: { status: 'completed', type: 'payment', createdAt: { $gte: lastMonth, $lte: lastMonthEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Booking.countDocuments({ createdAt: { $gte: thisYear } }),
    Booking.countDocuments({ createdAt: { $gte: lastYear, $lte: lastYearEnd } }),
    Transaction.aggregate([
      { $match: { status: 'completed', type: 'payment', createdAt: { $gte: thisYear } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Transaction.aggregate([
      { $match: { status: 'completed', type: 'payment', createdAt: { $gte: lastYear, $lte: lastYearEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Promise.all([
      ServiceProvider.countDocuments({ createdAt: { $gte: thisMonth } }),
      Homeowner.countDocuments({ createdAt: { $gte: thisMonth } })
    ]),
    Promise.all([
      ServiceProvider.countDocuments({ createdAt: { $gte: lastMonth, $lte: lastMonthEnd } }),
      Homeowner.countDocuments({ createdAt: { $gte: lastMonth, $lte: lastMonthEnd } })
    ])
  ]);

  const calcChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  return {
    monthly: {
      bookings: {
        current: thisMonthBookings,
        previous: lastMonthBookings,
        change: calcChange(thisMonthBookings, lastMonthBookings)
      },
      revenue: {
        current: thisMonthRevenue[0]?.total || 0,
        previous: lastMonthRevenue[0]?.total || 0,
        change: calcChange(thisMonthRevenue[0]?.total || 0, lastMonthRevenue[0]?.total || 0)
      },
      newUsers: {
        current: thisMonthUsers[0] + thisMonthUsers[1],
        previous: lastMonthUsers[0] + lastMonthUsers[1],
        change: calcChange(thisMonthUsers[0] + thisMonthUsers[1], lastMonthUsers[0] + lastMonthUsers[1])
      }
    },
    yearly: {
      bookings: {
        current: thisYearBookings,
        previous: lastYearBookings,
        change: calcChange(thisYearBookings, lastYearBookings)
      },
      revenue: {
        current: thisYearRevenue[0]?.total || 0,
        previous: lastYearRevenue[0]?.total || 0,
        change: calcChange(thisYearRevenue[0]?.total || 0, lastYearRevenue[0]?.total || 0)
      }
    }
  };
}
