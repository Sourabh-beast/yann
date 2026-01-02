import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Notification from '@/models/Notification';

export async function POST(request) {
  try {
    await connectDB();
    
    // Parse request body
    const body = await request.json();
    const { notificationIds, userId } = body; // expects array of IDs
    
    // Authorization check
    const targetUserId = userId || request.headers.get('x-user-id');
    
    if (!targetUserId) {
       return NextResponse.json(
         { success: false, message: 'User ID is required' },
         { status: 401 }
       );
    }
    
    // Validate inputs
    if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
        return NextResponse.json(
            { success: false, message: 'Notification IDs are required' },
            { status: 400 }
        );
    }
    
    console.log(`📖 Marking ${notificationIds.length} notifications as read for user ${targetUserId}`);

    // Update notifications
    // Note: Since we are using a shared Notification model where recipients is an array,
    // we strictly need to find the element in recipients array matching userId and set read=true.
    // However, if the notification model is simple (one doc per user), we just update doc.
    // Based on previous files, 'recipients' seems to be an array of objects { userId, read, ... }
    
    // Efficient bulk update using arrayFilters
    const result = await Notification.updateMany(
        { 
            _id: { $in: notificationIds }, 
            'recipients.userId': targetUserId 
        },
        { 
            $set: { 'recipients.$.read': true } 
        }
    );
            
    // Fallback: If your schema is NOT using recipients array but just 'read' field at root (for dedicated docs)
    // You can also try: await Notification.updateMany({ _id: { $in: ids }, userId: targetUserId }, { $set: { read: true } });
    
    console.log(`✅ Marked as read. Modified: ${result.modifiedCount}`);

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
      data: { modifiedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Error marking notifications read:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update notifications', error: error.message },
      { status: 500 }
    );
  }
}
