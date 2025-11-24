import mongoose from "mongoose";

const residentRequestSchema = new mongoose.Schema(
  {
    homeowner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Homeowner",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    serviceType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 400,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "pending", "scheduled", "ongoing", "completed", "cancelled", "accepted", "denied"],
      default: "pending",
      index: true,
    },
    scheduledFor: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["routine", "urgent"],
      default: "routine",
    },
    locationLabel: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "Home",
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
      default: null,
    },
    negotiation: {
      isActive: {
        type: Boolean,
        default: false,
      },
      proposedAmount: {
        type: Number,
        default: null,
      },
      providerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceProvider",
        default: null,
      },
      providerName: {
        type: String,
        default: null,
      },
      note: {
        type: String,
        default: "",
      },
      status: {
        type: String,
        enum: ["idle", "pending", "accepted", "declined", "cancelled"],
        default: "idle",
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

residentRequestSchema.index({ homeowner: 1, createdAt: -1 });

export default mongoose.models.ResidentRequest || mongoose.model("ResidentRequest", residentRequestSchema);
