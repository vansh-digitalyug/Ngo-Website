import mongoose from "mongoose";

/**
 * CommunityResponsibility
 * ─────────────────────────────────────────────────────────────────────────────
 * Tracks when a User or NGO takes responsibility of a Community (mohalla/gao).
 * Lifecycle: pending → active → (completed | revoked)
 *
 * - Only ONE active "leader" per community is enforced in controller logic.
 * - Full history is preserved (status changes don't delete records).
 * - Admin approves/rejects requests and can revoke at any time.
 */
const communityResponsibilitySchema = new mongoose.Schema(
    {
        // ─── Community reference ───────────────────────────────────────────────
        communityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Community",
            required: true,
        },

        // ─── Who is taking responsibility ──────────────────────────────────────
        takenBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        takenByNgoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ngo",
            default: null,
        },
        takenByType: {
            type: String,
            enum: ["user", "ngo"],
            required: true,
        },
        // Denormalized for quick display without populate
        takenByName: { type: String, required: true, trim: true },
        takenByEmail: { type: String, required: true, trim: true },
        takenByPhone: { type: String, default: null },

        // ─── Role within the community ─────────────────────────────────────────
        role: {
            type: String,
            enum: ["leader", "co-leader", "coordinator", "volunteer"],
            default: "volunteer",
        },

        // ─── What they commit to do ────────────────────────────────────────────
        responsibilities: [{ type: String, trim: true, maxlength: 200 }],
        motivation: { type: String, trim: true, maxlength: 1000, default: "" },

        // ─── Status lifecycle ──────────────────────────────────────────────────
        status: {
            type: String,
            enum: ["pending", "active", "completed", "revoked"],
            default: "pending",
        },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },

        // ─── Admin management ──────────────────────────────────────────────────
        adminNote: { type: String, default: null },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        approvedAt: { type: Date, default: null },
        revokedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        revokedAt: { type: Date, default: null },
        revokeReason: { type: String, default: null },

        // ─── Completion report (filled by the responsible person) ──────────────
        completionReport: { type: String, default: null },
        completedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
// Primary query pattern: "get all active responsibilities for community X"
communityResponsibilitySchema.index({ communityId: 1, status: 1 });
// "get responsibilities taken by user Y"
communityResponsibilitySchema.index({ takenBy: 1, status: 1 });
// "get responsibilities by NGO Z"
communityResponsibilitySchema.index({ takenByNgoId: 1, status: 1 });
// "get all leaders" (admin view)
communityResponsibilitySchema.index({ role: 1, status: 1, createdAt: -1 });
// Prevent duplicate pending/active requests from same user in same community
communityResponsibilitySchema.index({ communityId: 1, takenBy: 1, status: 1 });

const CommunityResponsibility = mongoose.model(
    "CommunityResponsibility",
    communityResponsibilitySchema
);
export default CommunityResponsibility;
