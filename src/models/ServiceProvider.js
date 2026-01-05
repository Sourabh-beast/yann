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
    lowercase: true,
    trim: true,
    sparse: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    sparse: true,
    validate: {
      validator: (value) => !value || /^[0-9]{10}$/.test(value),
      message: 'Please enter a valid 10-digit phone number'
    }
  },

  profileImage: {
    type: String,
    default: ''
  },

  avatar: {
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

  // Bio / About
  bio: {
    type: String,
    trim: true,
    maxlength: [300, 'Bio cannot exceed 300 characters'],
    default: ''
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
      },
      // Hourly billing support
      hourlyRate: {
        type: Number,
        min: [0, 'Hourly rate cannot be negative'],
        default: null
      },
      billingType: {
        type: String,
        enum: ['fixed', 'hourly', 'both'],
        default: 'fixed'
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

  // Working Shifts (for shift-based overtime)
  workingShifts: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: String,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)'],
      default: null
    },
    endTime: {
      type: String,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)'],
      default: null
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },

  // Driver-specific profile
  driverProfile: {
    carTypeSupported: {
      type: String,
      enum: ['manual', 'automatic', 'both', null],
      default: null
    }
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
  },

  // Admin controls
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedAt: {
    type: Date
  },
  blockedReason: {
    type: String,
    default: ''
  },

  // Aadhaar Verification (Meon DigiLocker)
  aadhaarVerified: {
    type: Boolean,
    default: false
  },
  aadhaarPhone: {
    type: String,
    trim: true
  },
  aadhaarVerifiedAt: {
    type: Date
  },
  // Admin approval (required after Aadhaar verification)
  adminApproved: {
    type: Boolean,
    default: false
  },
  adminApprovedAt: {
    type: Date
  },
  adminApprovedBy: {
    type: String
  },

  // Document verification
  documents: {
    aadhaar: {
      number: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
      imageUrl: String
    },
    pan: {
      number: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date,
      imageUrl: String
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      verified: { type: Boolean, default: false },
      verifiedAt: Date
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Wallet for earnings
  wallet: {
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  // Push Notifications
  pushToken: {
    type: String,
    default: null
  },
  pushNotificationsEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Indexes for better query performance
serviceProviderSchema.index({ services: 1 });
serviceProviderSchema.index({ status: 1 });
// Create sparse unique indexes for email and phone
serviceProviderSchema.index({ email: 1 }, { unique: true, sparse: true });
serviceProviderSchema.index({ phone: 1 }, { unique: true, sparse: true });

// Ensure at least one of email or phone is present
serviceProviderSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    next(new Error('Either email or phone number is required'));
  } else {
    next();
  }
});

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

// Method to get hourly rate for a service
serviceProviderSchema.methods.getHourlyRateForService = function (serviceName) {
  if (!serviceName || !Array.isArray(this.serviceRates)) return null;
  const normalized = serviceName.trim().toLowerCase();
  const entry = this.serviceRates.find(rate => rate.serviceName?.trim().toLowerCase() === normalized);
  return entry ? entry.hourlyRate : null;
};

// Method to check if booking is within shift
serviceProviderSchema.methods.isBookingWithinShift = function (startTime, endTime) {
  if (!this.workingShifts || !this.workingShifts.enabled) {
    return { withinShift: true, overtimeMinutes: 0 };
  }

  const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const shiftEndMinutes = parseTimeToMinutes(this.workingShifts.endTime);
  const bookingEndMinutes = parseTimeToMinutes(endTime);

  if (bookingEndMinutes > shiftEndMinutes) {
    return {
      withinShift: false,
      overtimeMinutes: bookingEndMinutes - shiftEndMinutes
    };
  }

  return { withinShift: true, overtimeMinutes: 0 };
};

// Method to calculate shift overtime minutes
serviceProviderSchema.methods.calculateShiftOvertime = function (actualEndTime) {
  if (!this.workingShifts || !this.workingShifts.enabled || !this.workingShifts.endTime) {
    return 0;
  }

  const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Extract time from Date object
  const endDate = new Date(actualEndTime);
  const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

  const shiftEndMinutes = parseTimeToMinutes(this.workingShifts.endTime);
  const actualEndMinutes = parseTimeToMinutes(endTimeStr);

  return Math.max(0, actualEndMinutes - shiftEndMinutes);
};

export default mongoose.models.ServiceProvider || mongoose.model('ServiceProvider', serviceProviderSchema);
