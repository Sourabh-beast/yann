import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
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
    otpHash: { type: String, required: true },
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

otpSchema.index({ email: 1, audience: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);
