import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Service Details
  serviceId: {
    type: String,  // Changed from Number to String to accept MongoDB ObjectIds
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  serviceCategory: {
    type: String,
    required: true,
    enum: [
      'cleaning',
      'deep-clean',
      'bathroom',
      'kitchen',
      'laundry',
      'carpet',
      'window',
      'move',
      'pujari',
      'specialty',
      'driver',
      'general',
      'domestic',
      'maintenance',
      'healthcare',
      'security',
      'beauty',
      'events',
      'office'
    ]
  },

  // Customer Details
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homeowner',
    default: null // Can be null for guest bookings
  },
  customerName: {
    type: String,
    default: 'Guest'
  },
  customerPhone: {
    type: String,
    required: false,  // Made optional for flexibility
    default: ''
  },
  customerAddress: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },

  // Booking Schedule
  bookingDate: {
    type: Date,
    required: true
  },
  bookingTime: {
    type: String,
    required: true
  },

  // Pricing
  basePrice: {
    type: Number,
    required: true
  },
  extras: [{
    serviceId: Number,
    serviceName: String,
    price: Number
  }],
  totalPrice: {
    type: Number,
    required: true
  },

  // Pricing Breakdown (GST details)
  pricingBreakdown: {
    baseCost: Number,
    gst: Number,
    gstPercentage: Number,
    extras: Number,
    quantity: Number,
    subtotal: Number,
    total: Number,
    breakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },

  // Payment Details (different for pujari vs others)
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'one-time', 'monthly', 'online', 'wallet'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],  // Added 'partial' for staged payments
    default: 'pending'
  },
  razorpayOrderId: {
    type: String,
    default: null
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },

  // Wallet Payment Staging (for escrow-based wallet payments)
  walletPaymentStage: {
    type: String,
    enum: ['none', 'initial_25_held', 'initial_25_released', 'completion_75_pending', 'completed'],
    default: 'none'
  },

  // Escrow tracking for wallet payments
  escrowDetails: {
    initialAmount: { type: Number, default: 0 },        // 25% amount
    completionAmount: { type: Number, default: 0 },     // 75% amount
    initialPaidAt: { type: Date, default: null },       // When 25% was paid
    initialReleasedAt: { type: Date, default: null },   // When 25% was released to partner
    initialRefundedAt: { type: Date, default: null },   // When 25% was refunded (if rejected)
    completionPaidAt: { type: Date, default: null }     // When 75% was paid
  },

  // Billing Type (for non-pujari services)
  billingType: {
    type: String,
    enum: ['one-time', 'monthly', 'cash', 'hourly', 'daily'],
    default: 'one-time'
  },
  quantity: {
    type: Number,
    default: 1
  },

  // Special Notes
  notes: {
    type: String,
    default: ''
  },

  // Driver specific metadata (legacy - kept for backward compatibility)
  driverDetails: {
    startTime: String,
    endTime: String,
    totalHours: Number,
    baseHours: Number,
    hourlyRate: Number,
    overtimeHours: Number,
    overtimeRate: Number,
    overtimeMultiplier: Number,
    baseCost: Number,
    overtimeCost: Number
  },

  // Hourly booking details (new unified structure)
  hourlyBookingDetails: {
    bookedHours: {
      type: Number,
      min: [0, 'Booked hours cannot be negative'],
      default: null
    },
    hourlyRate: {
      type: Number,
      min: [0, 'Hourly rate cannot be negative'],
      default: null
    },

    // Booking time window
    scheduledStartTime: {
      type: Date,
      default: null
    },
    expectedEndTime: {
      type: Date,
      default: null
    },
    actualStartTime: {
      type: Date,
      default: null
    },
    actualEndTime: {
      type: Date,
      default: null
    },

    // Shift information (if applicable)
    partnerShiftStart: {
      type: String,
      default: null
    },
    partnerShiftEnd: {
      type: String,
      default: null
    },

    // Cost breakdown
    baseCost: {
      type: Number,
      default: 0
    },

    // Type 1: Booking exceeded overtime
    actualHours: {
      type: Number,
      default: null
    },
    overtimeHours: {
      type: Number,
      default: 0
    },
    overtimeRate: {
      type: Number,
      default: null
    },
    overtimeCost: {
      type: Number,
      default: 0
    },

    // Type 2: Shift-based premium overtime
    shiftOvertimeHours: {
      type: Number,
      default: 0
    },
    shiftOvertimeRate: {
      type: Number,
      default: null
    },
    shiftOvertimeCost: {
      type: Number,
      default: 0
    },

    // Final totals
    totalHourlyCharge: {
      type: Number,
      default: 0
    },
    overtimeType: {
      type: String,
      enum: ['none', 'booking_exceeded', 'shift_based', 'both'],
      default: 'none'
    }
  },

  // Driver-specific requirements
  driverRequirements: {
    carType: {
      type: String,
      enum: ['manual', 'automatic', null],
      default: null
    }
  },

  // Provider Assignment
  assignedProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    default: null
  },
  providerName: {
    type: String,
    default: null
  },

  // Link to resident request for homeowner dashboards
  residentRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResidentRequest',
    default: null,
    index: true
  },

  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'awaiting_response', 'accepted', 'in_progress', 'rejected', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },

  // Booking Request Timer (3-minute response window)
  requestTimer: {
    // When the request was sent to provider
    sentAt: {
      type: Date,
      default: null
    },
    // Expiry time (sentAt + 3 minutes)
    expiresAt: {
      type: Date,
      default: null
    },
    // Provider's response
    respondedAt: {
      type: Date,
      default: null
    },
    // Whether the request timed out
    timedOut: {
      type: Boolean,
      default: false
    },
    // Continuous notification tracking
    lastBuzzerAt: {
      type: Date,
      default: null
    },
    buzzerCount: {
      type: Number,
      default: 0
    }
  },

  // Job Session (for tracking job start/end with OTP)
  jobSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSession',
    default: null
  },

  negotiation: {
    isActive: {
      type: Boolean,
      default: false
    },
    proposedAmount: {
      type: Number,
      default: null
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
      default: null
    },
    providerName: {
      type: String,
      default: null
    },
    note: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['idle', 'pending', 'accepted', 'declined', 'cancelled'],
      default: 'idle'
    },
    respondedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: null
    },
    history: [
      {
        proposedAmount: Number,
        note: String,
        providerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ServiceProvider'
        },
        providerName: String,
        status: {
          type: String,
          enum: ['pending', 'accepted', 'declined', 'cancelled'],
          default: 'pending'
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },

  // Provider Responses (for tracking which providers saw/rejected)
  providerResponses: [{
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider'
    },
    response: {
      type: String,
      enum: ['viewed', 'accepted', 'rejected']
    },
    respondedAt: {
      type: Date,
      default: Date.now
    },
    rejectionReason: String
  }],

  // Timestamps
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },

  // Rating Status
  hasBeenRated: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // createdAt, updatedAt
});

// Indexes
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ assignedProvider: 1, status: 1 });
bookingSchema.index({ serviceCategory: 1, status: 1 });
bookingSchema.index({ bookingDate: 1 });

// Virtual for formatted booking date
bookingSchema.virtual('formattedDate').get(function () {
  return this.bookingDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Method to check if booking is for pujari service
bookingSchema.methods.isPujariService = function () {
  return this.serviceCategory === 'pujari';
};

// Method to check if booking uses hourly pricing
bookingSchema.methods.isHourlyBooking = function () {
  return this.hourlyBookingDetails && this.hourlyBookingDetails.bookedHours > 0;
};

// Method to calculate total with extras
bookingSchema.methods.calculateTotal = function () {
  const extrasTotal = this.extras && this.extras.length > 0
    ? this.extras.reduce((sum, extra) => sum + extra.price, 0)
    : 0;

  // Hourly booking calculation
  if (this.isHourlyBooking()) {
    const baseCost = this.hourlyBookingDetails.baseCost || 0;
    const overtimeCost = this.hourlyBookingDetails.overtimeCost || 0;
    const shiftOvertimeCost = this.hourlyBookingDetails.shiftOvertimeCost || 0;
    return baseCost + overtimeCost + shiftOvertimeCost + extrasTotal;
  }

  // Legacy driver details calculation (backward compatibility)
  if (this.serviceCategory === 'driver' && this.driverDetails) {
    const baseCost = this.driverDetails.baseCost || 0;
    const overtimeCost = this.driverDetails.overtimeCost || 0;
    return baseCost + overtimeCost + extrasTotal;
  }

  let total = this.basePrice + extrasTotal;

  if (this.billingType === 'monthly' && !this.isPujariService()) {
    total *= 4;
  }

  if (this.billingType === 'daily' && !this.isPujariService()) {
    total *= this.quantity;
    return total;
  }

  total *= this.quantity;
  return total;
};

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
// Motoriot