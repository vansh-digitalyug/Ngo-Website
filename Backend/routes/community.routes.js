import express from "express";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import {
    getCommunities,
    getNearbyCommunities,
    getCommunityById,
    getCommunityActivities,
    getCommunityStats,
    createCommunity,
    takeResponsibility,
    getMyResponsibilities,
    submitCompletionReport,
    // Activity CRUD
    createCommunityActivity,
    getActivityById,
    getAllActivitiesForCommunity,
    updateCommunityActivity,
    completeCommunityActivity,
    deleteCommunityActivity,
    getMyActivities,
} from "../controllers/community.controller.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES (no auth required)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/community
 * Search & list communities.
 * Query: search, state, district, city, areaType, lat, lng, maxDistance, page, limit
 */
router.get("/", getCommunities);

/**
 * GET /api/community/nearby
 * Find communities near a GPS point.
 * Query: lat (required), lng (required), maxDistance (metres, default 10000), limit
 */
router.get("/nearby", getNearbyCommunities);

/**
 * GET /api/community/:id
 * Get full details of a single community.
 */
router.get("/:id", getCommunityById);

/**
 * GET /api/community/:id/activities
 * Public feed: only completed + admin-verified activities.
 * Query: activityType, page, limit
 */
router.get("/:id/activities", getCommunityActivities);

/**
 * GET /api/community/:id/activities/all
 * All activities for a community (any status) — for leader/member view.
 * Requires authentication.
 */
router.get("/:id/activities/all", authenticate, getAllActivitiesForCommunity);

/**
 * POST /api/community/:id/activities
 * Create a new activity for a community (must have active responsibility).
 */
router.post("/:id/activities", authenticate, createCommunityActivity);

/**
 * GET /api/community/:id/stats
 * Public statistics for a community.
 */
router.get("/:id/stats", getCommunityStats);

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATED ROUTES (login required)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/community/my/responsibilities
 * Get the logged-in user's responsibility records across all communities.
 */
router.get("/my/responsibilities", authenticate, getMyResponsibilities);

/**
 * GET /api/community/my/activities
 * Get the logged-in user's own posted activities across all communities.
 */
router.get("/my/activities", authenticate, getMyActivities);

/**
 * GET /api/community/activities/:actId
 * Get a single activity by ID.
 */
router.get("/activities/:actId", getActivityById);

/**
 * PUT /api/community/activities/:actId
 * Update activity (conductor only).
 */
router.put("/activities/:actId", authenticate, updateCommunityActivity);

/**
 * PUT /api/community/activities/:actId/complete
 * Mark activity as completed (conductor only).
 */
router.put("/activities/:actId/complete", authenticate, completeCommunityActivity);

/**
 * DELETE /api/community/activities/:actId
 * Delete activity (conductor only, not if completed).
 */
router.delete("/activities/:actId", authenticate, deleteCommunityActivity);

/**
 * POST /api/community
 * Register a new community (requires login).
 * Body: { name, areaType, description, address, pincode, city, district, state,
 *         location: { coordinates: [lng, lat] }, population, tags }
 */
router.post("/", authenticate, createCommunity);

/**
 * POST /api/community/:id/responsibility
 * Take responsibility of a community.
 * Body: { role, responsibilities[], motivation }
 */
router.post("/:id/responsibility", authenticate, takeResponsibility);

/**
 * PUT /api/community/responsibilities/:id/report
 * Submit a completion report for a responsibility.
 * Body: { completionReport }
 */
router.put("/responsibilities/:id/report", authenticate, submitCompletionReport);

export default router;
