import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Review from '@/models/Review';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const rating = searchParams.get('rating');
    const search = searchParams.get('search');
    const flagged = searchParams.get('flagged');
    
    const query = {};
    
    if (status) query.status = status;
    if (rating) query.rating = parseInt(rating);
    if (flagged === 'true') query.isFlagged = true;
    if (search) {
      query.$or = [
        { reviewerName: { $regex: search, $options: 'i' } },
        { providerName: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } }
      ];
    }

    const [reviews, total, stats] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
      Review.aggregate([
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            avgRating: { $avg: '$rating' },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
            flagged: { $sum: { $cond: ['$isFlagged', 1, 0] } },
            fiveStars: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            fourStars: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
            threeStars: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
            twoStars: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
            oneStar: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
          }
        }
      ])
    ]);

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || {
          totalReviews: 0,
          avgRating: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          flagged: 0,
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0
        }
      }
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// Approve/Reject/Flag review
export async function PATCH(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, action, reason } = body;
    
    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: 'Review ID and action required' },
        { status: 400 }
      );
    }

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    const now = new Date();

    switch (action) {
      case 'approve':
        review.status = 'approved';
        review.isFlagged = false;
        review.moderatedAt = now;
        review.moderationNote = reason || 'Approved by admin';
        break;
        
      case 'reject':
        review.status = 'rejected';
        review.moderatedAt = now;
        review.moderationNote = reason || 'Rejected by admin';
        break;
        
      case 'flag':
        review.isFlagged = true;
        review.status = 'flagged';
        review.flagReason = reason || 'Flagged for review';
        review.flaggedAt = now;
        review.flaggedBy = 'admin';
        break;
        
      case 'unflag':
        review.isFlagged = false;
        review.status = 'approved';
        review.flagReason = null;
        break;
        
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    await review.save();

    return NextResponse.json({
      success: true,
      message: `Review ${action}ed successfully`,
      data: review
    });
  } catch (error) {
    console.error('Review update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// Delete review
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Review ID required' },
        { status: 400 }
      );
    }

    const review = await Review.findByIdAndDelete(id);
    
    if (!review) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Review delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
