import mongoose from "mongoose";

const localProblemSchema = new mongoose.Schema(
    {
        villageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VillageAdoption",
            default: null, // null = village not yet in system
        },
        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ngo",
            default: null, // null = not yet assigned to an NGO
        },
        // Free-text location for villages not yet adopted
        villageName: { type: String, trim: true, default: "" },
        district:    { type: String, trim: true, default: "" },
        state:       { type: String, trim: true, default: "" },
        pincode:     { type: String, trim: true, default: "" },

        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null, // null = anonymous
        },
        submittedByName: { type: String, default: "Anonymous" },

        title: {
            type: String,
            required: [true, "Problem title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, "Description cannot exceed 2000 characters"],
            default: "",
        },
        category: {
            type: String,
            enum: ["water", "sanitation", "education", "health", "road", "employment", "electricity", "other"],
            required: true,
            default: "other",
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "solved"],
            default: "pending",
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },

        // Who upvoted this problem
        upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

        // S3 keys for attached photos
        attachments: [{ type: String }],

        // Resolution info
        resolvedAt: { type: Date, default: null },
        resolvedNote: { type: String, default: "" },
        resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
localProblemSchema.index({ villageId: 1, status: 1 });
localProblemSchema.index({ ngoId: 1, status: 1 });
localProblemSchema.index({ category: 1, status: 1 });
localProblemSchema.index({ createdAt: -1 });

const LocalProblem = mongoose.model("LocalProblem", localProblemSchema);
export default LocalProblem;
