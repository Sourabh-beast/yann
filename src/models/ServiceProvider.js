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
    enum: [
      'Home Cleaning',
      'Plumbing',
      'Electrical',
      'Carpentry',
      'Painting',
      'AC Repair',
      'Appliance Repair',
      'Pest Control',
      'Beauty & Wellness',
      'Tutoring',
      'Photography',
      'Catering',
      'Other'
    ],
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'At least one service is required'
    }
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
serviceProviderSchema.index({ email: 1 });
serviceProviderSchema.index({ services: 1 });
serviceProviderSchema.index({ status: 1 });

// Virtual for working hours display
serviceProviderSchema.virtual('workingHoursDisplay').get(function () {
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

export default mongoose.models.ServiceProvider || mongoose.model('ServiceProvider', serviceProviderSchema);
