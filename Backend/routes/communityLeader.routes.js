import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
    requireCommunityLeader,
    requireCommunityLeaderOnly,
} from "../middlewares/communityLeader.middleware.js";
import {
    getLeaderDashboard,
    getMyCommunity,
    updateMyCommunity,
    getCommunityMembers,
    createActivity,
    getLeaderActivities,
    getActivityById,
    updateActivity,
    startActivity,
    completeActivity,
    cancelActivity,
} from "../controllers/communityLeader.controller.js";

const router = express.Router();

// All community-leader routes require authentication + active community leader role
router.use(authenticate, requireCommunityLeader);

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/community-leader/dashboard
 * Summary stats for the leader's community.
 */
router.get("/dashboard", getLeaderDashboard);

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITY INFO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/community-leader/community
 * Full details of the leader's assigned community.
 */
router.get("/community", getMyCommunity);

/**
 * PUT /api/community-leader/community
 * Update community info (description, address, tags, etc.).
 * Only leader role can do this.
 * Body: { description?, address?, pincode?, tags?, population?, coverImageKey? }
 */
router.put("/community", requireCommunityLeaderOnly, updateMyCommunity);

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/community-leader/members
 * Get all responsibilities (members) in the community.
 * Query: status (pending|active|completed|revoked), role, page, limit
 */
router.get("/members", getCommunityMembers);

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/community-leader/activities
 * All activities in the leader's community.
 * Query: status, activityType, page, limit
 */
router.get("/activities", getLeaderActivities);

/**
 * POST /api/community-leader/activities
 * Create a new community activity.
 * Body: { title, description, activityType, plannedDate, specificLocation,
 *         beneficiariesCount, volunteersCount, responsibilityId? }
 */
router.post("/activities", createActivity);

/**
 * GET /api/community-leader/activities/:id
 * Get single activity detail.
 */
router.get("/activities/:id", getActivityById);

/**
 * PUT /api/community-leader/activities/:id
 * Update an activity (before admin verification).
 */
router.put("/activities/:id", updateActivity);

/**
 * PUT /api/community-leader/activities/:id/start
 * Mark activity as ongoing (planned → ongoing).
 */
router.put("/activities/:id/start", startActivity);

/**
 * PUT /api/community-leader/activities/:id/complete
 * Mark activity as completed with media and completion note.
 * Body: { completionNote, mediaKeys[], mediaThumbnailKey, beneficiariesCount, volunteersCount }
 */
router.put("/activities/:id/complete", completeActivity);

/**
 * DELETE /api/community-leader/activities/:id
 * Cancel a planned or ongoing activity.
 */
router.delete("/activities/:id", cancelActivity);

export default router;
