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

export default mongoose.models.CallRequest || mongoose.model("CallRequest", callRequestSchema);
