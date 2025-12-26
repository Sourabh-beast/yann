import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  // Basic Info
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  
  // Discount Details
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  maxDiscount: Number, // Max discount amount for percentage type
  minOrderValue: {
    type: Number,
    default: 0
  },
  
  // Validity
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Usage Limits
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usageCount: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: 1
  },
  
  // Targeting
  applicableTo: {
    type: String,
    enum: ['all', 'new_users', 'existing_users', 'specific_services'],
    default: 'all'
  },
  applicableServices: [String], // Service names if applicable
  
  // User Restrictions
  allowedUsers: [{
    userId: mongoose.Schema.Types.ObjectId,
    userType: String
  }],
  usedBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    userType: String,
    usedAt: Date,
    orderId: mongoose.Schema.Types.ObjectId,
    discountApplied: Number
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Type
  couponType: {
    type: String,
    enum: ['promo', 'referral', 'loyalty', 'seasonal', 'special'],
    default: 'promo'
  },
  
  // Referral specific
  referralDetails: {
    referrerBonus: Number,
    refereeBonus: Number
  },
  
  // Created by
  createdBy: String
}, {
  timestamps: true
});

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.usageLimit === null || this.usageCount < this.usageLimit)
  );
};

// Indexes (code index not needed here as field has unique: true)
couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ couponType: 1 });

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
