import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 40, default: "Home" },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    phone: { type: String, required: true, trim: true, maxlength: 15 },
    apartment: { type: String, trim: true, maxlength: 40, default: "" },
    building: { type: String, trim: true, maxlength: 60, default: "" },
    street: { type: String, required: true, trim: true, maxlength: 120 },
    city: { type: String, trim: true, maxlength: 60, default: "" },
    state: { type: String, trim: true, maxlength: 60, default: "" },
    postalCode: { type: String, trim: true, maxlength: 12, default: "" },
    fullAddress: { type: String, trim: true, maxlength: 300, default: "" },
    latitude: { type: Number },
    longitude: { type: Number },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true } // Enable _id for subdocuments
);

const homeownerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [60, "Name cannot exceed 60 characters"],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => !value || /^[0-9]{10}$/.test(value),
        message: "Please enter a valid 10-digit phone number",
      },
    },
    avatar: {
      type: String,
      default: "",
    },
    preferences: {
      type: [String],
      default: [],
    },
    savedProviders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
      },
    ],
    addressBook: {
      type: [addressSchema],
      default: [],
    },
    lastLoginAt: {
      type: Date,
    },
    // Admin controls
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedAt: {
      type: Date,
    },
    blockedReason: {
      type: String,
      default: "",
    },
    // Wallet
    wallet: {
      balance: {
        type: Number,
        default: 0,
        min: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    // Aadhaar Verification (Meon DigiLocker)
    aadhaarVerified: {
      type: Boolean,
      default: false,
    },
    aadhaarPhone: {
      type: String,
      trim: true,
    },
    aadhaarVerifiedAt: {
      type: Date,
    },
    // Document verification
    documents: {
      aadhaar: {
        number: String,
        verified: { type: Boolean, default: false },
        verifiedAt: Date,
        imageUrl: String,
      },
      pan: {
        number: String,
        verified: { type: Boolean, default: false },
        verifiedAt: Date,
        imageUrl: String,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Push Notifications
    pushToken: {
      type: String,
      default: null,
    },
    pushNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create sparse unique indexes for email and phone
// This allows users to sign up with either email OR phone
homeownerSchema.index({ email: 1 }, { unique: true, sparse: true });
homeownerSchema.index({ phone: 1 }, { unique: true, sparse: true });

// Ensure at least one of email or phone is present
homeownerSchema.pre('validate', function(next) {
  if (!this.email && !this.phone) {
    next(new Error('Either email or phone number is required'));
  } else {
    next();
  }
});

export default mongoose.models.Homeowner || mongoose.model("Homeowner", homeownerSchema);
