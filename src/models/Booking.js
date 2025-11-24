import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  // Service Details
  serviceId: {
    type: Number,
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
      'general'
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
    required: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  customerAddress: {
    type: String,
    required: true
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

  // Payment Details (different for pujari vs others)
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'one-time', 'monthly', 'online'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
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

  // Driver specific metadata
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
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
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
  completedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
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
bookingSchema.virtual('formattedDate').get(function() {
  return this.bookingDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

// Method to check if booking is for pujari service
bookingSchema.methods.isPujariService = function() {
  return this.serviceCategory === 'pujari';
};

// Method to calculate total with extras
bookingSchema.methods.calculateTotal = function() {
  const extrasTotal = this.extras && this.extras.length > 0
    ? this.extras.reduce((sum, extra) => sum + extra.price, 0)
    : 0;

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
