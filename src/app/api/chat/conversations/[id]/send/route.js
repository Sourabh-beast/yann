import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import Homeowner from '@/models/Homeowner';
import Provider from '@/models/Provider';

/**
 * POST /api/chat/conversations/[id]/send
 * Send a new message in a conversation
 */
export async function POST(request, { params }) {
  try {
    await connectDB();

    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: conversationId } = params;
    const body = await request.json();
    const { message, messageType = 'text', attachmentUrl = null } = body;

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Verify conversation exists and user is a participant
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

    // Get sender details
    const UserModel = userRole === 'provider' ? Provider : Homeowner;
    const sender = await UserModel.findById(userId).select('name email');

    if (!sender) {
      return NextResponse.json(
        { success: false, message: 'Sender not found' },
        { status: 404 }
      );
    }

    // Get recipient ID (the other participant)
    const recipientDetail = conversation.participantDetails.find(
      p => p.id.toString() !== userId
    );

    if (!recipientDetail) {
      return NextResponse.json(
        { success: false, message: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Create the message
    const newMessage = await Message.create({
      conversationId,
      senderId: userId,
      senderModel: userRole === 'provider' ? 'Provider' : 'Homeowner',
      senderDetails: {
        id: userId,
        name: sender.name,
        email: sender.email,
        role: userRole
      },
      recipientId: recipientDetail.id,
      message: message.trim(),
      messageType,
      attachmentUrl,
      attachmentType: attachmentUrl ? 'image' : null,
      status: 'sent'
    });

    // Update conversation's last message and unread count
    const recipientId = recipientDetail.id.toString();
    const currentUnreadCount = conversation.unreadCount.get(recipientId) || 0;

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        message: message.trim(),
        senderId: userId,
        createdAt: newMessage.createdAt,
        read: false
      },
      $set: {
        [`unreadCount.${recipientId}`]: currentUnreadCount + 1
      },
      updatedAt: new Date()
    });

    // Format response
    const formattedMessage = {
      id: newMessage._id.toString(),
      conversationId: newMessage.conversationId.toString(),
      senderId: userId,
      senderName: sender.name,
      recipientId: recipientDetail.id.toString(),
      message: newMessage.message,
      messageType: newMessage.messageType,
      attachmentUrl: newMessage.attachmentUrl,
      read: false,
      status: 'sent',
      createdAt: newMessage.createdAt
    };

    return NextResponse.json({
      success: true,
      message: formattedMessage
    }, { status: 201 });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to send message',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
