import mongoose from 'mongoose';

/**
 * Message Schema
 * Represents individual chat messages within a conversation
 */
const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  
  senderModel: {
    type: String,
    required: true,
    enum: ['Homeowner', 'Provider']
  },
  
  senderDetails: {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true, enum: ['homeowner', 'provider'] }
  },
  
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  
  messageType: {
    type: String,
    enum: ['text', 'image', 'file'],
    default: 'text'
  },
  
  // For future attachment support
  attachmentUrl: {
    type: String,
    default: null
  },
  
  attachmentType: {
    type: String,
    enum: ['image', 'document', 'audio', null],
    default: null
  },
  
  read: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date,
    default: null
  },
  
  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: {
    type: Date,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, read: 1 });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;
