import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  // Action Details
  action: {
    type: String,
    required: true,
    enum: [
      // Auth actions
      'login', 'logout', 'login_failed', 'password_change', 'password_reset',
      // Admin management
      'admin_create', 'admin_update', 'admin_delete', 'admin_activate', 'admin_deactivate',
      // User management
      'user_block', 'user_unblock', 'user_delete', 'user_verify',
      // Provider management
      'provider_approve', 'provider_reject', 'provider_block', 'provider_unblock',
      // Booking management
      'booking_create', 'booking_update', 'booking_cancel', 'booking_complete',
      // Financial
      'refund_process', 'payment_update', 'commission_update',
      // Settings
      'settings_update', 'platform_settings_update',
      // Content
      'service_create', 'service_update', 'service_delete',
      'coupon_create', 'coupon_update', 'coupon_delete',
      'notification_send', 'announcement_create',
      // Review management
      'review_approve', 'review_reject', 'review_delete', 'review_flag',
      // Support
      'ticket_assign', 'ticket_resolve', 'ticket_escalate',
      // System
      'system_error', 'api_error', 'database_error',
      // Generic
      'create', 'update', 'delete', 'view', 'export', 'import', 'other'
    ]
  },
  
  // Who performed the action
  performedBy: {
    adminId: mongoose.Schema.Types.ObjectId,
    adminName: String,
    adminEmail: String,
    adminRole: String
  },
  
  // Target of the action
  target: {
    type: {
      type: String,
      enum: ['admin', 'provider', 'homeowner', 'booking', 'service', 'coupon', 'ticket', 'review', 'notification', 'settings', 'system', 'other']
    },
    id: mongoose.Schema.Types.ObjectId,
    name: String
  },
  
  // Details
  description: String,
  details: mongoose.Schema.Types.Mixed, // Flexible JSON for additional details
  
  // Before/After values for updates
  previousValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  
  // Request info
  ipAddress: String,
  userAgent: String,
  requestMethod: String,
  requestPath: String,
  
  // Status
  status: {
    type: String,
    enum: ['success', 'failed', 'warning'],
    default: 'success'
  },
  errorMessage: String,
  
  // Category for filtering
  category: {
    type: String,
    enum: ['auth', 'admin', 'user', 'booking', 'financial', 'content', 'support', 'system', 'other'],
    default: 'other'
  },
  
  // Severity
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ 'performedBy.adminId': 1 });
auditLogSchema.index({ category: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ 'target.type': 1, 'target.id': 1 });

// Static method to create log easily
auditLogSchema.statics.log = async function(data) {
  try {
    const log = new this(data);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    return null;
  }
};

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
