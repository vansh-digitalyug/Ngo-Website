import mongoose from "mongoose";

const fundRequestSchema = new mongoose.Schema(
    {
        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ngo",
            required: [true, "NGO ID is required"]
        },
        ngoName: {
            type: String,
            required: [true, "NGO name is required"],
            trim: true
        },
        amount: {
            type: Number,
            required: [true, "Requested amount is required"],
            min: [1, "Amount must be greater than 0"]
        },
        purpose: {
            type: String,
            required: [true, "Purpose is required"],
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Released", "Rejected"],
            default: "Pending"
        },
        adminNote: {
            type: String,
            trim: true,
            default: ""
        },
        releasedAt: {
            type: Date,
            default: null
        },
        isResolved: {
            type: Boolean,
            default: false
        },
        resolvedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

// ✅ Added indexes
fundRequestSchema.index({ ngoId: 1, status: 1 });     // NGO dashboard: requests by status
fundRequestSchema.index({ status: 1, createdAt: -1 }); // admin queue: pending requests first

export default mongoose.model("FundRequest", fundRequestSchema);
