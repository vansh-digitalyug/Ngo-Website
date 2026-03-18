import mongoose from "mongoose";

/**
 * CommunityActivity
 * ─────────────────────────────────────────────────────────────────────────────
 * Records work/activities performed in a Community.
 * Posted by community leaders/coordinators, verified by admin.
 *
 * Status flow: planned → ongoing → completed / cancelled
 */
const communityActivitySchema = new mongoose.Schema(
    {
        // ─── Community & responsibility link ───────────────────────────────────
        communityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            required: true,
        },
        // Optional: link to the responsibility record that triggered this
        responsibilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CommunityResponsibility",
            default: null,
        },

        // ─── Activity details ──────────────────────────────────────────────────
        title: {
            type: String,
            required: [true, "Activity title is required"],
            trim: true,
            maxlength: [150, "Title cannot exceed 150 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, "Description cannot exceed 2000 characters"],
            default: "",
        },
        activityType: {
            type: String,
            enum: [
                "cleanup",
                "medical_camp",
                "education",
                "food_distribution",
                "infrastructure",
                "awareness",
                "tree_plantation",
                "skill_development",
                "sanitation",
                "women_empowerment",
                "child_welfare",
                "other",
            ],
            required: [true, "Activity type is required"],
        },

        // ─── Status lifecycle ──────────────────────────────────────────────────
        status: {
            type: String,
            enum: ["planned", "ongoing", "completed", "cancelled"],
            default: "planned",
        },
        plannedDate: { type: Date, required: [true, "Planned date is required"] },
        completedDate: { type: Date, default: null },

        // ─── Location within community ─────────────────────────────────────────
        specificLocation: { type: String, trim: true, default: "" },

        // ─── Media (S3 keys) ───────────────────────────────────────────────────
        mediaKeys: [{ type: String }],       // S3 keys for activity photos/videos
        mediaThumbnailKey: { type: String, default: null },

        // ─── Conducted by ─────────────────────────────────────────────────────
        conductedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        conductedByName: { type: String, trim: true }, // denormalized
        conductedByNgoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ngo",
            default: null,
        },

        // ─── Impact metrics ────────────────────────────────────────────────────
        beneficiariesCount: { type: Number, min: 0, default: 0 },
        volunteersCount: { type: Number, min: 0, default: 0 },

        // ─── Admin verification ────────────────────────────────────────────────
        adminVerified: { type: Boolean, default: false },
        adminNote: { type: String, default: null },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        verifiedAt: { type: Date, default: null },

        // ─── Leader feedback ───────────────────────────────────────────────────
        leaderFeedback: { type: String, trim: true, default: null },

        // ─── Volunteer note (completion note from conductor) ───────────────────
        completionNote: { type: String, trim: true, default: null },
    },
    { timestamps: true }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
// Primary: activities per community sorted by time
communityActivitySchema.index({ communityId: 1, createdAt: -1 });
// Filter by status within a community
communityActivitySchema.index({ communityId: 1, status: 1 });
// Admin: all activities needing verification
communityActivitySchema.index({ adminVerified: 1, status: 1, createdAt: -1 });
// Activities by type (analytics)
communityActivitySchema.index({ activityType: 1, status: 1 });
// Activities by conductor
communityActivitySchema.index({ conductedBy: 1, status: 1 });
// Planned date for upcoming activities feed
communityActivitySchema.index({ plannedDate: 1, status: 1 });

const CommunityActivity = mongoose.model("CommunityActivity", communityActivitySchema);
export default CommunityActivity;
