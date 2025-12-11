import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';

/**
 * GET /api/chat/conversations/[id]/messages
 * Get all messages for a specific conversation
 */
export async function GET(request, { params }) {
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

    // Get pagination params
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const before = url.searchParams.get('before'); // Message ID for pagination

    // Build query
    const query = {
      conversationId,
      isDeleted: false
    };

    if (before) {
      const beforeMessage = await Message.findById(before);
      if (beforeMessage) {
        query.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    // Fetch messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Format messages for frontend
    const formattedMessages = messages.reverse().map(msg => ({
      id: msg._id.toString(),
      conversationId: msg.conversationId.toString(),
      senderId: msg.senderDetails.id.toString(),
      senderName: msg.senderDetails.name,
      recipientId: msg.recipientId.toString(),
      message: msg.message,
      messageType: msg.messageType,
      attachmentUrl: msg.attachmentUrl,
      read: msg.read,
      readAt: msg.readAt,
      status: msg.status,
      createdAt: msg.createdAt
    }));

    return NextResponse.json({
      success: true,
      messages: formattedMessages,
      hasMore: messages.length === limit
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch messages',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
