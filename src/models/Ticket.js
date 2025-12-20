import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  // Ticket ID (auto-generated)
  ticketId: {
    type: String,
    unique: true
  },
  
  // Requester Info
  requester: {
    userId: mongoose.Schema.Types.ObjectId,
    userType: {
      type: String,
      enum: ['homeowner', 'provider', 'guest']
    },
    name: String,
    email: String,
    phone: String
  },
  
  // Related entities
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  relatedProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },
  
  // Ticket Details
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['booking', 'payment', 'refund', 'provider', 'service', 'account', 'technical', 'feedback', 'other'],
    default: 'other'
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_customer', 'waiting_internal', 'resolved', 'closed'],
    default: 'open'
  },
  
  // Assignment
  assignedTo: {
    adminId: mongoose.Schema.Types.ObjectId,
    adminName: String,
    assignedAt: Date
  },
  
  // Messages/Conversation
  messages: [{
    sender: {
      type: String,
      enum: ['customer', 'admin', 'system']
    },
    senderName: String,
    message: String,
    attachments: [{
      name: String,
      url: String,
      type: String
    }],
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Resolution
  resolution: {
    resolvedBy: String,
    resolvedAt: Date,
    resolutionNote: String,
    satisfactionRating: Number // 1-5
  },
  
  // Escalation
  isEscalated: {
    type: Boolean,
    default: false
  },
  escalatedAt: Date,
  escalationReason: String,
  
  // SLA
  firstResponseAt: Date,
  slaBreached: {
    type: Boolean,
    default: false
  },
  
  // Tags
  tags: [String],
  
  // Metadata
  source: {
    type: String,
    enum: ['web', 'app', 'email', 'phone', 'chat'],
    default: 'web'
  }
}, {
  timestamps: true
});

// Generate ticket ID before saving
ticketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TKT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
ticketSchema.index({ ticketId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ 'requester.userId': 1 });
ticketSchema.index({ 'assignedTo.adminId': 1 });
ticketSchema.index({ createdAt: -1 });

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);
