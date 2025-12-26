import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  // Basic Info
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: String,
  
  // Authentication
  password: {
    type: String,
    required: true
  },
  
  // Role & Permissions
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'support'],
    default: 'admin'
  },
  permissions: {
    dashboard: { type: Boolean, default: true },
    analytics: { type: Boolean, default: true },
    services: { type: Boolean, default: true },
    providers: { type: Boolean, default: true },
    homeowners: { type: Boolean, default: true },
    bookings: { type: Boolean, default: true },
    reviews: { type: Boolean, default: true },
    financials: { type: Boolean, default: false },
    notifications: { type: Boolean, default: false },
    promotions: { type: Boolean, default: false },
    support: { type: Boolean, default: true },
    settings: { type: Boolean, default: false },
    logs: { type: Boolean, default: false },
    manageAdmins: { type: Boolean, default: false }
  },
  
  // Profile
  avatar: String,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  lastLoginIP: String,
  
  // Security
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  passwordChangedAt: Date,
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
adminSchema.methods.isLocked = function() {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Indexes (email index not needed here as field has unique: true)
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema);
