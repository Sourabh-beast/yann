import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    trim: true,
    lowercase: true,
  },
  price: {
    type: String,
    required: [true, 'Service price is required'],
  },
  features: [{
    type: String,
    trim: true,
  }],
  icon: {
    type: String,
    default: '🏠',
  },
  popular: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Base price for admin control
  basePrice: {
    type: Number,
    default: 0,
  },
  minPrice: {
    type: Number,
    default: 0,
  },
  maxPrice: {
    type: Number,
    default: 0,
  },
  // Duration in minutes
  estimatedDuration: {
    type: Number,
    default: 60,
  },
  // Image/icon
  image: {
    type: String,
    default: '',
  },
  // Tags for search
  tags: [{
    type: String,
    trim: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster queries
ServiceSchema.index({ category: 1, popular: -1 });
ServiceSchema.index({ isActive: 1 });

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);
