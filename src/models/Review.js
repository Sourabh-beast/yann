import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // Who wrote the review
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homeowner',
    required: true
  },
  reviewerName: String,
  reviewerPhone: String,

  // Who is being reviewed
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  providerName: String,

  // Related booking
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },

  // Service details
  service: {
    type: String,
    required: true
  },
  serviceCategory: String,

  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: String,
  comment: {
    type: String,
    required: false // Optional - users can submit ratings without comments
  },

  // Review status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved'
  },

  // Flagging/Moderation
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  flaggedAt: Date,
  flaggedBy: String,

  // Admin moderation
  moderatedBy: String,
  moderatedAt: Date,
  moderationNote: String,

  // Provider response
  providerResponse: {
    comment: String,
    respondedAt: Date
  },

  // Helpful votes
  helpfulCount: {
    type: Number,
    default: 0
  },

  // Verification
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ provider: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isFlagged: 1 });

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
