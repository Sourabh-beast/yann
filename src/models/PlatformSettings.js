import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema({
  // Singleton identifier
  key: {
    type: String,
    default: 'platform_settings',
    unique: true
  },

  // Commission Settings
  commission: {
    defaultPercentage: {
      type: Number,
      default: 15
    },
    byService: [{
      serviceName: String,
      percentage: Number
    }],
    minimumAmount: {
      type: Number,
      default: 10
    }
  },

  // Cancellation Policy
  cancellation: {
    freeCancellationHours: {
      type: Number,
      default: 24 // Free cancellation within 24 hours of booking
    },
    lateCancellationFee: {
      type: Number,
      default: 20 // Percentage
    },
    noShowFee: {
      type: Number,
      default: 50 // Percentage
    },
    providerCancellationPenalty: {
      type: Number,
      default: 100 // Fixed amount
    }
  },

  // Booking Settings
  booking: {
    advanceBookingDays: {
      type: Number,
      default: 30
    },
    minBookingHours: {
      type: Number,
      default: 2
    },
    maxBookingHours: {
      type: Number,
      default: 12
    },
    autoConfirmEnabled: {
      type: Boolean,
      default: false
    },
    requirePaymentUpfront: {
      type: Boolean,
      default: true
    }
  },

  // Payment Settings
  payment: {
    supportedMethods: [{
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'cash']
    }],
    codEnabled: {
      type: Boolean,
      default: true
    },
    codMaxAmount: {
      type: Number,
      default: 5000
    },
    refundProcessingDays: {
      type: Number,
      default: 7
    }
  },

  // Wallet Payment Configuration
  walletPayment: {
    // Percentage of booking amount required upfront (25%)
    initialBookingPercentage: {
      type: Number,
      default: 25,
      min: 10,
      max: 50
    },
    // Commission percentage on partner withdrawals (10-20%)
    partnerWithdrawalCommission: {
      type: Number,
      default: 15,
      min: 10,
      max: 20
    },
    // Minimum withdrawal amount
    minWithdrawalAmount: {
      type: Number,
      default: 1
    },
    // Maximum withdrawal amount per transaction
    maxWithdrawalAmount: {
      type: Number,
      default: 100000
    },
    // Auto-approve withdrawals below this amount
    autoApproveWithdrawalLimit: {
      type: Number,
      default: 1000
    },
    // Withdrawal processing days
    withdrawalProcessingDays: {
      type: Number,
      default: 3
    }
  },

  // Service Areas
  serviceAreas: {
    cities: [String],
    pincodes: [String],
    enabled: {
      type: Boolean,
      default: true
    }
  },

  // Operating Hours
  operatingHours: {
    startTime: {
      type: String,
      default: '06:00'
    },
    endTime: {
      type: String,
      default: '22:00'
    },
    workingDays: [{
      type: Number // 0-6, 0 = Sunday
    }]
  },

  // Notification Settings
  notifications: {
    emailEnabled: {
      type: Boolean,
      default: true
    },
    smsEnabled: {
      type: Boolean,
      default: true
    },
    pushEnabled: {
      type: Boolean,
      default: true
    }
  },

  // Referral Program
  referral: {
    enabled: {
      type: Boolean,
      default: true
    },
    referrerReward: {
      type: Number,
      default: 100
    },
    refereeDiscount: {
      type: Number,
      default: 50
    },
    maxReferrals: {
      type: Number,
      default: 10
    }
  },

  // Provider Settings
  provider: {
    autoApproveEnabled: {
      type: Boolean,
      default: false
    },
    documentsRequired: [{
      type: String,
      enum: ['aadhaar', 'pan', 'bank_details', 'photo', 'address_proof']
    }],
    minimumRating: {
      type: Number,
      default: 3.0
    },
    maxActiveBookings: {
      type: Number,
      default: 5
    }
  },

  // Support Settings
  support: {
    email: String,
    phone: String,
    whatsapp: String,
    responseTimeHours: {
      type: Number,
      default: 24
    }
  },

  // Maintenance Mode
  maintenance: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: String,
    allowedIPs: [String]
  },

  // Last updated
  lastUpdatedBy: {
    adminId: mongoose.Schema.Types.ObjectId,
    adminName: String,
    updatedAt: Date
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
platformSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne({ key: 'platform_settings' });
  if (!settings) {
    settings = await this.create({
      key: 'platform_settings',
      'payment.supportedMethods': ['upi', 'card', 'netbanking', 'wallet', 'cash'],
      'operatingHours.workingDays': [1, 2, 3, 4, 5, 6], // Mon-Sat
      'provider.documentsRequired': ['aadhaar', 'pan', 'photo']
    });
  }
  return settings;
};

export default mongoose.models.PlatformSettings || mongoose.model('PlatformSettings', platformSettingsSchema);
