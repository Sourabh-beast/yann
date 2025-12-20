import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Notification from '@/models/Notification';
import Homeowner from '@/models/Homeowner';
import ServiceProvider from '@/models/ServiceProvider';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;

    const [notifications, total, stats] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
      Notification.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            scheduled: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
            draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
            totalSentCount: { $sum: '$stats.sent' },
            totalDelivered: { $sum: '$stats.delivered' },
            totalOpened: { $sum: '$stats.opened' }
          }
        }
      ])
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || {
          total: 0,
          sent: 0,
          scheduled: 0,
          draft: 0,
          totalSentCount: 0,
          totalDelivered: 0,
          totalOpened: 0
        }
      }
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Create and send notification
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      type, 
      targetAudience, 
      title, 
      message, 
      htmlContent,
      category,
      priority,
      scheduledFor,
      actionUrl,
      actionText,
      sendNow 
    } = body;
    
    if (!type || !title || !message) {
      return NextResponse.json(
        { success: false, message: 'Type, title and message are required' },
        { status: 400 }
      );
    }

    // Get recipient count based on audience
    let recipientCount = 0;
    let recipients = [];

    if (targetAudience === 'all' || targetAudience === 'homeowners') {
      const homeowners = await Homeowner.find({ isBlocked: { $ne: true } })
        .select('_id phone email fullName')
        .lean();
      recipientCount += homeowners.length;
      recipients.push(...homeowners.map(h => ({
        userId: h._id,
        userType: 'homeowner',
        phone: h.phone,
        email: h.email,
        name: h.fullName
      })));
    }

    if (targetAudience === 'all' || targetAudience === 'providers') {
      const providers = await ServiceProvider.find({ 
        status: 'active', 
        isBlocked: { $ne: true } 
      })
        .select('_id phone email fullName')
        .lean();
      recipientCount += providers.length;
      recipients.push(...providers.map(p => ({
        userId: p._id,
        userType: 'provider',
        phone: p.phone,
        email: p.email,
        name: p.fullName
      })));
    }

    const notification = new Notification({
      type,
      targetAudience: targetAudience || 'all',
      recipients: targetAudience === 'specific' ? body.recipients : recipients,
      title,
      message,
      htmlContent,
      category: category || 'announcement',
      priority: priority || 'normal',
      actionUrl,
      actionText,
      isScheduled: !!scheduledFor,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      status: sendNow ? 'sending' : (scheduledFor ? 'scheduled' : 'draft'),
      stats: {
        totalRecipients: recipientCount,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: 0
      },
      createdBy: 'admin'
    });

    await notification.save();

    // If sendNow, simulate sending (in real app, this would trigger actual sending)
    if (sendNow) {
      // Simulate sending process
      notification.status = 'sent';
      notification.sentAt = new Date();
      notification.stats.sent = recipientCount;
      notification.stats.delivered = Math.floor(recipientCount * 0.95); // 95% delivery rate simulation
      await notification.save();
    }

    return NextResponse.json({
      success: true,
      message: sendNow ? 'Notification sent successfully' : 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Notification create error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

// Update notification (cancel, resend, etc.)
export async function PATCH(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, action } = body;
    
    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: 'ID and action required' },
        { status: 400 }
      );
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'cancel':
        if (notification.status === 'scheduled') {
          notification.status = 'cancelled';
          notification.isScheduled = false;
        } else {
          return NextResponse.json(
            { success: false, message: 'Can only cancel scheduled notifications' },
            { status: 400 }
          );
        }
        break;
        
      case 'send':
        if (notification.status === 'draft' || notification.status === 'scheduled') {
          notification.status = 'sent';
          notification.sentAt = new Date();
          notification.stats.sent = notification.stats.totalRecipients;
          notification.stats.delivered = Math.floor(notification.stats.totalRecipients * 0.95);
        }
        break;
        
      case 'deactivate':
        notification.isActive = false;
        break;
        
      case 'activate':
        notification.isActive = true;
        break;
        
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

    await notification.save();

    return NextResponse.json({
      success: true,
      message: `Notification ${action}ed successfully`,
      data: notification
    });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

// Delete notification
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Notification ID required' },
        { status: 400 }
      );
    }

    const notification = await Notification.findByIdAndDelete(id);
    
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Notification delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
