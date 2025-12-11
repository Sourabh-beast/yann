import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import Homeowner from '@/models/Homeowner';

const HOME_COOKIE = 'yann_home_session';

/**
 * POST /api/chat/conversations/[id]/send
 * Send a message in a conversation
 */
export async function POST(request, { params }) {
  try {
    await connectDB();

    // Get conversation ID from params
    const { id: conversationId } = params;

    // Verify authentication
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    let token = cookies().get(HOME_COOKIE)?.value;
    
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const homeowner = await Homeowner.findById(decoded.id);
    if (!homeowner) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get message content from request body
    const { message, recipientId } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, message: 'Message content is required' },
        { status: 400 }
      );
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify user is part of the conversation
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === homeowner._id.toString()
    );

    if (!isParticipant) {
      return NextResponse.json(
        { success: false, message: 'You are not a participant in this conversation' },
        { status: 403 }
      );
    }

    // Create new message
    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId: homeowner._id,
      senderModel: 'Homeowner',
      message: message.trim(),
      read: false,
    });

    // Update conversation's last message and timestamp
    conversation.lastMessage = message.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate sender details
    await newMessage.populate('senderId', 'name email profileImage');

    // Format response
    const formattedMessage = {
      id: newMessage._id.toString(),
      conversationId: newMessage.conversationId.toString(),
      senderId: newMessage.senderId._id.toString(),
      senderName: newMessage.senderId.name,
      senderImage: newMessage.senderId.profileImage || null,
      message: newMessage.message,
      read: newMessage.read,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: formattedMessage,
    });

  } catch (error) {
    console.error('Error sending message:', error);
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