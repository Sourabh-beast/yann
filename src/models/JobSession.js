import mongoose from 'mongoose';
import crypto from 'crypto';

const jobSessionSchema = new mongoose.Schema({
  // References
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Homeowner',
    required: true
  },

  // Start OTP Management
  startOTP: {
    type: String, // Hashed OTP
    default: null
  },
  startOTPPlain: {
    type: String, // Plain OTP (only for customer display, cleared after use)
    default: null
  },
  startOTPExpiry: {
    type: Date,
    default: null
  },
  startOTPVerified: {
    type: Boolean,
    default: false
  },

  // End OTP Management
  endOTP: {
    type: String, // Hashed OTP
    default: null
  },
  endOTPPlain: {
    type: String, // Plain OTP (only for customer display, cleared after use)
    default: null
  },
  endOTPExpiry: {
    type: Date,
    default: null
  },
  endOTPVerified: {
    type: Boolean,
    default: false
  },

  // Time Tracking
  startTime: {
    type: Date,
    default: null
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // Total duration in minutes
    default: 0
  },

  // Overtime Calculation
  expectedDuration: {
    type: Number, // Expected duration in minutes (from workingHours)
    default: 0
  },
  overtimeDuration: {
    type: Number, // Overtime in minutes
    default: 0
  },
  baseHourlyRate: {
    type: Number,
    default: 0
  },
  overtimeRate: {
    type: Number, // 1.5x base rate
    default: 0
  },
  overtimeCharge: {
    type: Number,
    default: 0
  },
  totalCharge: {
    type: Number,
    default: 0
  },

  // Status
  status: {
    type: String,
    enum: ['pending_start', 'in_progress', 'pending_end', 'completed', 'cancelled'],
    default: 'pending_start',
    index: true
  },

  // Metadata
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes
jobSessionSchema.index({ booking: 1, status: 1 });
jobSessionSchema.index({ provider: 1, status: 1 });
jobSessionSchema.index({ customer: 1, status: 1 });

// Method to generate 4-digit OTP
jobSessionSchema.methods.generateOTP = function() {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  return { otp, hash };
};

// Method to verify OTP
jobSessionSchema.methods.verifyOTP = function(inputOTP, hashedOTP) {
  const inputHash = crypto.createHash('sha256').update(inputOTP).digest('hex');
  return inputHash === hashedOTP;
};

// Method to calculate expected duration from working hours
jobSessionSchema.methods.calculateExpectedDuration = function(workingHours) {
  if (!workingHours || !workingHours.startTime || !workingHours.endTime) {
    return 480; // Default 8 hours
  }

  const [startHours, startMinutes] = workingHours.startTime.split(':').map(Number);
  const [endHours, endMinutes] = workingHours.endTime.split(':').map(Number);

  const startInMinutes = startHours * 60 + startMinutes;
  const endInMinutes = endHours * 60 + endMinutes;

  return endInMinutes - startInMinutes;
};

// Method to calculate overtime
jobSessionSchema.methods.calculateOvertime = function() {
  if (!this.startTime || !this.endTime) {
    return { duration: 0, overtimeDuration: 0, overtimeCharge: 0, totalCharge: 0 };
  }

  // Calculate duration in minutes
  const durationMs = this.endTime - this.startTime;
  const duration = Math.floor(durationMs / (1000 * 60));

  // Calculate overtime
  const overtimeDuration = Math.max(0, duration - this.expectedDuration);
  
  // Calculate charges
  const regularDuration = Math.min(duration, this.expectedDuration);
  const regularCharge = (regularDuration / 60) * this.baseHourlyRate;
  const overtimeCharge = (overtimeDuration / 60) * this.overtimeRate;
  const totalCharge = regularCharge + overtimeCharge;

  return {
    duration,
    overtimeDuration,
    overtimeCharge: Math.round(overtimeCharge * 100) / 100,
    totalCharge: Math.round(totalCharge * 100) / 100
  };
};

export default mongoose.models.JobSession || mongoose.model('JobSession', jobSessionSchema);
