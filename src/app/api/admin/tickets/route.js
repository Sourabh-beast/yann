import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Ticket from '@/models/Ticket';
import AuditLog from '@/models/AuditLog';

// GET - Fetch tickets
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const assignedTo = searchParams.get('assignedTo');
    
    const query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query['assignedTo.adminId'] = assignedTo;
    
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { 'requester.name': { $regex: search, $options: 'i' } },
        { 'requester.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    const [tickets, total, stats] = await Promise.all([
      Ticket.find(query)
        .sort({ priority: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(query),
      Ticket.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
            closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
            urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
            high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
            escalated: { $sum: { $cond: ['$isEscalated', 1, 0] } }
          }
        }
      ])
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || {
          total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0,
          urgent: 0, high: 0, escalated: 0
        }
      }
    });
  } catch (error) {
    console.error('Tickets fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST - Create ticket or add message
export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { action } = body;
    
    if (action === 'create') {
      const { requester, subject, description, category, priority, relatedBooking, source } = body;
      
      if (!subject || !description) {
        return NextResponse.json(
          { success: false, message: 'Subject and description are required' },
          { status: 400 }
        );
      }
      
      const ticket = new Ticket({
        requester: requester || { userType: 'guest' },
        subject,
        description,
        category: category || 'other',
        priority: priority || 'medium',
        relatedBooking,
        source: source || 'web',
        messages: [{
          sender: 'customer',
          senderName: requester?.name || 'Customer',
          message: description,
          createdAt: new Date()
        }]
      });
      
      await ticket.save();
      
      return NextResponse.json({
        success: true,
        message: 'Ticket created successfully',
        data: ticket
      });
    }
    
    if (action === 'add_message') {
      const { ticketId, message, sender, senderName, isInternal } = body;
      
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return NextResponse.json(
          { success: false, message: 'Ticket not found' },
          { status: 404 }
        );
      }
      
      ticket.messages.push({
        sender: sender || 'admin',
        senderName: senderName || 'Admin',
        message,
        isInternal: isInternal || false,
        createdAt: new Date()
      });
      
      // Update first response time if this is admin's first response
      if (sender === 'admin' && !ticket.firstResponseAt) {
        ticket.firstResponseAt = new Date();
      }
      
      // Update status if needed
      if (sender === 'admin' && ticket.status === 'open') {
        ticket.status = 'in_progress';
      } else if (sender === 'customer' && ticket.status === 'waiting_customer') {
        ticket.status = 'in_progress';
      }
      
      await ticket.save();
      
      return NextResponse.json({
        success: true,
        message: 'Message added successfully',
        data: ticket
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Ticket create error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// PUT - Update ticket
export async function PUT(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Ticket ID required' },
        { status: 400 }
      );
    }
    
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    if (updates.status) ticket.status = updates.status;
    if (updates.priority) ticket.priority = updates.priority;
    if (updates.category) ticket.category = updates.category;
    if (updates.tags) ticket.tags = updates.tags;
    
    await ticket.save();
    
    return NextResponse.json({
      success: true,
      message: 'Ticket updated successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Ticket update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

// PATCH - Assign, resolve, escalate ticket
export async function PATCH(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, action, adminId, adminName, resolutionNote, escalationReason } = body;
    
    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: 'Ticket ID and action required' },
        { status: 400 }
      );
    }
    
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    switch (action) {
      case 'assign':
        ticket.assignedTo = {
          adminId,
          adminName,
          assignedAt: new Date()
        };
        ticket.status = 'in_progress';
        
        await AuditLog.log({
          action: 'ticket_assign',
          performedBy: { adminName: adminName || 'Admin' },
          target: { type: 'ticket', id: ticket._id, name: ticket.ticketId },
          description: `Ticket ${ticket.ticketId} assigned to ${adminName}`,
          category: 'support',
          severity: 'info'
        });
        break;
        
      case 'resolve':
        ticket.status = 'resolved';
        ticket.resolution = {
          resolvedBy: adminName || 'Admin',
          resolvedAt: new Date(),
          resolutionNote: resolutionNote || ''
        };
        
        await AuditLog.log({
          action: 'ticket_resolve',
          performedBy: { adminName: adminName || 'Admin' },
          target: { type: 'ticket', id: ticket._id, name: ticket.ticketId },
          description: `Ticket ${ticket.ticketId} resolved`,
          category: 'support',
          severity: 'info'
        });
        break;
        
      case 'close':
        ticket.status = 'closed';
        break;
        
      case 'reopen':
        ticket.status = 'open';
        ticket.resolution = null;
        break;
        
      case 'escalate':
        ticket.isEscalated = true;
        ticket.escalatedAt = new Date();
        ticket.escalationReason = escalationReason;
        ticket.priority = 'urgent';
        
        await AuditLog.log({
          action: 'ticket_escalate',
          performedBy: { adminName: adminName || 'Admin' },
          target: { type: 'ticket', id: ticket._id, name: ticket.ticketId },
          description: `Ticket ${ticket.ticketId} escalated: ${escalationReason}`,
          category: 'support',
          severity: 'warning'
        });
        break;
        
      case 'set_waiting':
        ticket.status = 'waiting_customer';
        break;
        
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
    
    await ticket.save();
    
    return NextResponse.json({
      success: true,
      message: `Ticket ${action}ed successfully`,
      data: ticket
    });
  } catch (error) {
    console.error('Ticket action error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process action' },
      { status: 500 }
    );
  }
}

// DELETE - Delete ticket
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Ticket ID required' },
        { status: 400 }
      );
    }
    
    const ticket = await Ticket.findByIdAndDelete(id);
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully'
    });
  } catch (error) {
    console.error('Ticket delete error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}
