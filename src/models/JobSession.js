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

  // Shift-based overtime (Type 2)
  shiftOvertimeDuration: {
    type: Number, // Minutes beyond shift
    default: 0
  },
  shiftOvertimeRate: {
    type: Number, // 2× base rate
    default: 0
  },
  shiftOvertimeCharge: {
    type: Number,
    default: 0
  },

  // Overtime type indicator
  overtimeType: {
    type: String,
    enum: ['none', 'booking_exceeded', 'shift_based', 'both'],
    default: 'none'
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
jobSessionSchema.methods.generateOTP = function () {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  return { otp, hash };
};

// Method to verify OTP
jobSessionSchema.methods.verifyOTP = function (inputOTP, hashedOTP) {
  const inputHash = crypto.createHash('sha256').update(inputOTP).digest('hex');
  return inputHash === hashedOTP;
};

// Method to calculate expected duration from working hours
jobSessionSchema.methods.calculateExpectedDuration = function (workingHours) {
  if (!workingHours || !workingHours.startTime || !workingHours.endTime) {
    return 480; // Default 8 hours
  }

  const [startHours, startMinutes] = workingHours.startTime.split(':').map(Number);
  const [endHours, endMinutes] = workingHours.endTime.split(':').map(Number);

  const startInMinutes = startHours * 60 + startMinutes;
  const endInMinutes = endHours * 60 + endMinutes;

  return endInMinutes - startInMinutes;
};

// Method to calculate overtime (Type 1: Booking exceeded)
jobSessionSchema.methods.calculateOvertime = function () {
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

// Method to calculate shift-based overtime (Type 2)
jobSessionSchema.methods.calculateShiftBasedOvertime = function (shiftEndTime) {
  if (!this.startTime || !this.endTime || !shiftEndTime) {
    return { shiftOvertimeDuration: 0, shiftOvertimeCharge: 0 };
  }

  const parseTimeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Extract time from Date object
  const endDate = new Date(this.endTime);
  const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

  const shiftEndMinutes = parseTimeToMinutes(shiftEndTime);
  const actualEndMinutes = parseTimeToMinutes(endTimeStr);

  const shiftOvertimeDuration = Math.max(0, actualEndMinutes - shiftEndMinutes);
  const shiftOvertimeRate = this.baseHourlyRate * 2; // 2× premium
  const shiftOvertimeCharge = (shiftOvertimeDuration / 60) * shiftOvertimeRate;

  return {
    shiftOvertimeDuration,
    shiftOvertimeCharge: Math.round(shiftOvertimeCharge * 100) / 100
  };
};

// Method to calculate combined overtime (both types)
jobSessionSchema.methods.calculateCombinedOvertime = function (params) {
  const { bookedMinutes, shiftEndTime } = params;

  if (!this.startTime || !this.endTime) {
    return {
      duration: 0,
      overtimeDuration: 0,
      overtimeCharge: 0,
      shiftOvertimeDuration: 0,
      shiftOvertimeCharge: 0,
      totalCharge: 0,
      overtimeType: 'none'
    };
  }

  const durationMs = this.endTime - this.startTime;
  const actualMinutes = Math.floor(durationMs / (1000 * 60));

  // Calculate Type 1: Booking exceeded
  const bookingOvertimeMinutes = Math.max(0, actualMinutes - bookedMinutes);

  // Calculate Type 2: Shift-based
  let shiftOvertimeMinutes = 0;
  if (shiftEndTime) {
    const parseTimeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const endDate = new Date(this.endTime);
    const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    const shiftEndMinutes = parseTimeToMinutes(shiftEndTime);
    const actualEndMinutes = parseTimeToMinutes(endTimeStr);
    shiftOvertimeMinutes = Math.max(0, actualEndMinutes - shiftEndMinutes);
  }

  // Determine overtime type and calculate charges
  let overtimeType = 'none';
  let regularCharge = 0;
  let bookingOvertimeCharge = 0;
  let shiftOvertimeCharge = 0;

  if (shiftOvertimeMinutes > 0 && bookingOvertimeMinutes > 0) {
    // Both types apply - shift premium takes precedence for overlapping time
    overtimeType = 'both';

    // Regular time (within booking and shift)
    const regularMinutes = Math.min(actualMinutes, bookedMinutes);
    regularCharge = (regularMinutes / 60) * this.baseHourlyRate;

    // Booking exceeded but within shift
    const withinShiftOvertimeMinutes = Math.max(0, bookingOvertimeMinutes - shiftOvertimeMinutes);
    bookingOvertimeCharge = (withinShiftOvertimeMinutes / 60) * this.baseHourlyRate;

    // Shift overtime (premium rate)
    const shiftOvertimeRate = this.baseHourlyRate * 2;
    shiftOvertimeCharge = (shiftOvertimeMinutes / 60) * shiftOvertimeRate;

  } else if (shiftOvertimeMinutes > 0) {
    // Only shift overtime
    overtimeType = 'shift_based';
    const regularMinutes = actualMinutes - shiftOvertimeMinutes;
    regularCharge = (regularMinutes / 60) * this.baseHourlyRate;

    const shiftOvertimeRate = this.baseHourlyRate * 2;
    shiftOvertimeCharge = (shiftOvertimeMinutes / 60) * shiftOvertimeRate;

  } else if (bookingOvertimeMinutes > 0) {
    // Only booking exceeded
    overtimeType = 'booking_exceeded';
    regularCharge = (bookedMinutes / 60) * this.baseHourlyRate;
    bookingOvertimeCharge = (bookingOvertimeMinutes / 60) * this.baseHourlyRate;

  } else {
    // No overtime
    regularCharge = (actualMinutes / 60) * this.baseHourlyRate;
  }

  const totalCharge = regularCharge + bookingOvertimeCharge + shiftOvertimeCharge;

  return {
    duration: actualMinutes,
    overtimeDuration: bookingOvertimeMinutes,
    overtimeCharge: Math.round(bookingOvertimeCharge * 100) / 100,
    shiftOvertimeDuration: shiftOvertimeMinutes,
    shiftOvertimeCharge: Math.round(shiftOvertimeCharge * 100) / 100,
    totalCharge: Math.round(totalCharge * 100) / 100,
    overtimeType
  };
};

export default mongoose.models.JobSession || mongoose.model('JobSession', jobSessionSchema);
