import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    // Support both email and phone - one of them is required
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    
    // Type of identifier used (email or phone)
    identifierType: {
      type: String,
      enum: ["email", "phone"],
      default: "email",
    },
    
    audience: {
      type: String,
      enum: ["provider", "homeowner"],
      default: "provider",
      index: true,
    },
    intent: {
      type: String,
      enum: ["login", "signup"],
      default: "login",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // For email OTP - we store hash. For phone OTP via MSG91 - not needed (MSG91 handles it)
    otpHash: { type: String },
    // MSG91 request ID for phone OTP
    msg91RequestId: { type: String },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    sendCount: { type: Number, default: 1 },
    windowStartedAt: { type: Date, default: Date.now },
    lastSentAt: { type: Date, default: Date.now },
    blockedUntil: { type: Date },
    lastRequestIp: { type: String },
  },
  { timestamps: true }
);

// Indexes for both email and phone lookups
otpSchema.index({ email: 1, audience: 1 });
otpSchema.index({ phone: 1, audience: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);
