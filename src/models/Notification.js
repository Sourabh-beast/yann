import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Notification type
  type: {
    type: String,
    enum: ['push', 'email', 'sms', 'announcement', 'in-app'],
    required: true
  },
  
  // Target audience
  targetAudience: {
    type: String,
    enum: ['all', 'providers', 'homeowners', 'specific'],
    default: 'all'
  },
  
  // Specific recipients (if targetAudience is 'specific')
  recipients: [{
    userId: mongoose.Schema.Types.ObjectId,
    userType: {
      type: String,
      enum: ['provider', 'homeowner']
    },
    phone: String,
    email: String,
    name: String
  }],
  
  // Content
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Rich content (for emails/announcements)
  htmlContent: String,
  imageUrl: String,
  actionUrl: String,
  actionText: String,
  
  // Scheduling
  scheduledFor: Date,
  isScheduled: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
    default: 'draft'
  },
  
  // Delivery stats
  stats: {
    totalRecipients: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  
  // Sent info
  sentAt: Date,
  sentBy: String,
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Category/Tags
  category: {
    type: String,
    enum: ['promotional', 'transactional', 'system', 'reminder', 'announcement'],
    default: 'announcement'
  },
  tags: [String],
  
  // Expiry (for announcements)
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Created by
  createdBy: String
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ targetAudience: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ isActive: 1, expiresAt: 1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
