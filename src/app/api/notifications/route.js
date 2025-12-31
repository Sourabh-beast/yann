import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Notification from '@/models/Notification';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Can also get from header 'x-user-id' if passed
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Authorization check (basic)
    // In prod, you'd extract userId from session/token
    const targetUserId = userId || request.headers.get('x-user-id');
    
    if (!targetUserId) {
        return NextResponse.json(
            { success: false, message: 'User ID is required' },
            { status: 400 }
        );
    }
    
    console.log(`🔔 Fetching notifications for user: ${targetUserId}`);

    const skip = (page - 1) * limit;

    // Find notifications where user is in recipients list
    // OR targetAudience is 'all' (if you implement broadcast later)
    // Find notifications where user is in recipients list
    // OR targetAudience is 'all' (if you implement broadcast later)
    const query = {
        'recipients.userId': targetUserId,
        status: 'sent' // Only show sent notifs
    };

    console.log(`🔎 Notification Query:`, JSON.stringify(query));

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log(`✅ Found ${notifications.length} notifications`);

    const total = await Notification.countDocuments(query);

    // Map to mobile app format
    const formattedNotifications = notifications.map(n => ({
        id: n._id.toString(),
        type: n.tags?.[0] || 'general', // Use first tag as type
        title: n.title,
        message: n.message,
        timestamp: n.createdAt,
        read: false, // You might want to track read status in DB later
        data: n.metadata || {}
    }));

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notifications', error: error.message },
      { status: 500 }
    );
  }
}
