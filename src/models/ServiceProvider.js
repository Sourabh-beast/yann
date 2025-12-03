// models/ServiceProvider.js
import mongoose from 'mongoose';

// Sub-schema for working hours
const workingHoursSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  }
}, { _id: false });

const serviceProviderSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },

  profileImage: {
    type: String,
    default: ''
  },

  // Work Experience
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative'],
    max: [50, 'Experience cannot exceed 50 years']
  },

  // Services
  services: {
    type: [String],
    required: [true, 'At least one service is required'],
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one service is required'
    }
  },

  // Per-service pricing
  serviceRates: {
    type: [{
      serviceName: {
        type: String,
        required: true,
        trim: true
      },
      price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
      }
    }],
    default: [],
    validate: {
      validator: function (rates) {
        if (!Array.isArray(rates)) return false;
        const uniqueNames = new Set(rates.map(rate => rate.serviceName));
        return uniqueNames.size === rates.length;
      },
      message: 'Duplicate service pricing entries are not allowed'
    }
  },

  // Service Categories
  selectedCategories: {
    type: [String],
    default: []
  },

  // Working Hours
  workingHours: {
    type: workingHoursSchema,
    required: false
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending'
  },

  // Pending service request (for admin approval)
  pendingServiceRequest: {
    addedServices: {
      type: [String],
      default: []
    },
    addedRates: {
      type: [{
        serviceName: String,
        price: Number
      }],
      default: []
    },
    previousStatus: {
      type: String,
      enum: ['active', 'inactive', 'pending', null],
      default: null
    },
    requestedAt: {
      type: Date,
      default: null
    }
  },

  // Ratings
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
serviceProviderSchema.index({ services: 1 });
serviceProviderSchema.index({ status: 1 });

// Virtual for working hours display
serviceProviderSchema.virtual('workingHoursDisplay').get(function () {
  if (!this.workingHours) return '';
  return `${this.workingHours.startTime} - ${this.workingHours.endTime}`;
});

// Method to check if provider is available at a given time
serviceProviderSchema.methods.isAvailableAt = function (time) {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;

  const [startHours, startMinutes] = this.workingHours.startTime.split(':').map(Number);
  const startTimeInMinutes = startHours * 60 + startMinutes;

  const [endHours, endMinutes] = this.workingHours.endTime.split(':').map(Number);
  const endTimeInMinutes = endHours * 60 + endMinutes;

  return timeInMinutes >= startTimeInMinutes && timeInMinutes <= endTimeInMinutes;
};

serviceProviderSchema.methods.getPriceForService = function (serviceName) {
  if (!serviceName || !Array.isArray(this.serviceRates)) return null;
  const normalized = serviceName.trim().toLowerCase();
  const entry = this.serviceRates.find(rate => rate.serviceName?.trim().toLowerCase() === normalized);
  return entry ? entry.price : null;
};

export default mongoose.models.ServiceProvider || mongoose.model('ServiceProvider', serviceProviderSchema);
