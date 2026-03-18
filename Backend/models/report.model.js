import mongoose from "mongoose";

/**
 * Report
 * ─────────────────────────────────────────────────────────────────────────────
 * Authenticated users can report NGOs, volunteers, communities, activities,
 * or other users for review by the admin team.
 *
 * Status lifecycle: pending → under_review → (resolved | dismissed)
 * Severity: low | medium | high | critical — helps admin prioritize the sidebar queue.
 */
const reportSchema = new mongoose.Schema(
    {
        // ─── Reporter (must be logged in — accountability) ─────────────────────
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Reporter is required"],
        },
        reporterName: {
            type: String,
            trim: true,
            required: true,
        },
        reporterEmail: {
            type: String,
            trim: true,
            lowercase: true,
            required: true,
        },

        // ─── What is being reported ────────────────────────────────────────────
        reportType: {
            type: String,
            enum: [
                "ngo",
                "volunteer",
                "community",
                "community_activity",
                "user",
                "content",
                "other",
            ],
            required: [true, "Report type is required"],
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        targetName: {
            type: String,
            trim: true,
            default: null,
        },
        // Which Mongoose model the targetId refers to
        targetModel: {
            type: String,
            enum: ["Ngo", "Volunteer", "Community", "CommunityActivity", "User", null],
            default: null,
        },

        // ─── Report details ────────────────────────────────────────────────────
        severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
            maxlength: [200, "Subject cannot exceed 200 characters"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            minlength: [20, "Description must be at least 20 characters"],
            maxlength: [3000, "Description cannot exceed 3000 characters"],
        },
        evidenceUrls: [
            {
                type: String, // S3 keys or public URLs
            },
        ],

        // ─── Status & admin response ───────────────────────────────────────────
        status: {
            type: String,
            enum: ["pending", "under_review", "resolved", "dismissed"],
            default: "pending",
        },
        adminNote: {
            type: String,
            trim: true,
            default: null, // internal note, not shown to reporter
        },
        actionTaken: {
            type: String,
            trim: true,
            default: null, // e.g., "NGO suspended", "Warning issued"
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        resolvedAt: {
            type: Date,
            default: null,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },

        // ─── Duplicate guard: has this already been reported by this user? ─────
        // (enforced in controller with a pre-query check, not schema unique)
    },
    { timestamps: true }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
reportSchema.index({ status: 1, severity: 1, createdAt: -1 }); // admin queue (critical first)
reportSchema.index({ reportType: 1, status: 1 });               // filter by type
reportSchema.index({ reportedBy: 1, createdAt: -1 });           // user's own reports
reportSchema.index({ targetId: 1, reportType: 1 });             // reports about a specific entity
reportSchema.index({ severity: 1, createdAt: -1 });             // admin priority view
reportSchema.index({ createdAt: -1 });                          // recent first

const Report = mongoose.model("Report", reportSchema);
export default Report;
