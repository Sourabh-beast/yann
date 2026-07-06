import mongoose from "mongoose";

const callRequestSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "called", "resolved", "cancelled"],
            default: "pending",
        },
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Indexes
callRequestSchema.index({ status: 1, createdAt: -1 });
callRequestSchema.index({ phoneNumber: 1 });

export default mongoose.models.CallRequest || mongoose.model("CallRequest", callRequestSchema);
