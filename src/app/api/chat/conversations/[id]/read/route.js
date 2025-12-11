import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

/**
 * PUT /api/chat/conversations/[id]/read
 * Mark messages as read in a conversation
 */
export async function PUT(request, { params }) {
  try {
    await connectDB();

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: conversationId } = params;
    const body = await request.json();
    const { messageIds = [] } = body;

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participantDetails.id': userId
    });

    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Update messages as read
    let updateQuery;
    
    if (messageIds.length > 0) {
      // Mark specific messages as read
      updateQuery = {
        _id: { $in: messageIds },
        conversationId,
        recipientId: userId,
        read: false
      };
    } else {
      // Mark all unread messages in conversation as read
      updateQuery = {
        conversationId,
        recipientId: userId,
        read: false
      };
    }

    const result = await Message.updateMany(
      updateQuery,
      {
        $set: {
          read: true,
          readAt: new Date(),
          status: 'read'
        }
      }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        [`unreadCount.${userId}`]: 0
      }
    });

    return NextResponse.json({
      success: true,
      markedAsRead: result.modifiedCount
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to mark messages as read',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
