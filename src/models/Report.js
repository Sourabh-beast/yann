import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        reporterId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'reporterModel'
        },
        reporterModel: {
            type: String,
            required: true,
            enum: ['Homeowner', 'ServiceProvider']
        },
        reportedId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'reportedModel'
        },
        reportedModel: {
            type: String,
            required: true,
            enum: ['Homeowner', 'ServiceProvider']
        },
        reason: {
            type: String,
            required: true,
            enum: ['inappropriate_content', 'spam_scam', 'offensive_behavior', 'other']
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
            default: 'pending'
        },
        adminNotes: {
            type: String
        }
    },
    { timestamps: true }
);

// Indexes
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedId: 1, reportedModel: 1 });
reportSchema.index({ bookingId: 1 });

export default mongoose.models.Report || mongoose.model("Report", reportSchema);
