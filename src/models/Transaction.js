import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  // Reference to booking (optional for wallet transactions)
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },

  // Transaction Type
  type: {
    type: String,
    enum: ['payment', 'refund', 'commission', 'payout', 'wallet_topup', 'wallet_debit', 'wallet_refund'],
    required: true
  },

  // Amount Details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },

  // Commission (Platform fee)
  commissionAmount: {
    type: Number,
    default: 0
  },
  commissionPercentage: {
    type: Number,
    default: 10 // 10% default commission
  },
  providerAmount: {
    type: Number,
    default: 0
  },

  // Payment Gateway Details
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cash', 'upi', 'card', 'bank_transfer'],
    default: 'razorpay'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,

  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'disputed'],
    default: 'pending'
  },

  // Refund Details
  refundReason: String,
  refunded: {
    type: Boolean,
    default: false
  },
  refundedAt: Date,
  refundAmount: {
    type: Number,
    default: 0
  },

  // Dispute Details
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    reason: String,
    raisedBy: {
      type: String,
      enum: ['customer', 'provider', null],
      default: null
    },
    raisedAt: Date,
    resolvedAt: Date,
    resolution: String,
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'closed', null],
      default: null
    }
  },

  // References
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homeowner'
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider'
  },

  // Service Details (denormalized for quick access)
  serviceName: String,
  serviceCategory: String,

  // Wallet-specific fields
  balanceBefore: Number,
  balanceAfter: Number,
  description: String,

  // Metadata
  notes: String,
  processedBy: String // Admin ID who processed refund/dispute
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ bookingId: 1 });
transactionSchema.index({ status: 1, type: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ customerId: 1 });
transactionSchema.index({ providerId: 1 });

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
