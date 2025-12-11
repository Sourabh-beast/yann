import mongoose from 'mongoose';

/**
 * Conversation Schema
 * Represents a chat conversation between two users (homeowner and provider)
 */
const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'participantModels'
  }],
  
  participantModels: [{
    type: String,
    required: true,
    enum: ['Homeowner', 'Provider']
  }],
  
  participantDetails: [{
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true, enum: ['homeowner', 'provider'] }
  }],
  
  lastMessage: {
    message: { type: String, default: '' },
    senderId: { type: mongoose.Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  },
  
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  
  // Related booking (optional - if conversation started from a booking)
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ 'participantDetails.id': 1 });

// Update the updatedAt timestamp before saving
conversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

export default Conversation;
