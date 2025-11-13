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
      enum: ["draft", "pending", "scheduled", "ongoing", "completed", "cancelled"],
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
  },
  { timestamps: true }
);

residentRequestSchema.index({ homeowner: 1, createdAt: -1 });

export default mongoose.models.ResidentRequest || mongoose.model("ResidentRequest", residentRequestSchema);
