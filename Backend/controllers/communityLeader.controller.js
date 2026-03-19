import mongoose from "mongoose";
import Community from "../models/community.model.js";
import CommunityResponsibility from "../models/communityResponsibility.model.js";
import CommunityActivity from "../models/communityActivity.model.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/community-leader/dashboard
 * Summary stats for the leader's community dashboard.
 */
export const getLeaderDashboard = asyncHandler(async (req, res) => {
    const communityId = req.communityId;

    const [
        activeMembers,
        pendingMembers,
        totalActivities,
        completedActivities,
        ongoingActivities,
        pendingVerification,
        recentActivities,
    ] = await Promise.all([
        CommunityResponsibility.countDocuments({ communityId, status: "active" }),
        CommunityResponsibility.countDocuments({ communityId, status: "pending" }),
        CommunityActivity.countDocuments({ communityId }),
        CommunityActivity.countDocuments({ communityId, status: "completed" }),
        CommunityActivity.countDocuments({ communityId, status: "ongoing" }),
        CommunityActivity.countDocuments({ communityId, status: "completed", adminVerified: false }),
        CommunityActivity.find({ communityId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("title activityType status plannedDate completedDate adminVerified")
            .lean(),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Dashboard data fetched", {
            community: {
                _id:    req.community._id,
                name:   req.community.name,
                areaType: req.community.areaType,
                city:   req.community.city,
                state:  req.community.state,
                verificationStatus: req.community.verificationStatus,
            },
            role: req.communityRole,
            stats: {
                activeMembers,
                pendingMembers,
                totalActivities,
                completedActivities,
                ongoingActivities,
                pendingVerification, // completed but not yet verified by admin
            },
            recentActivities,
        })
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITY INFO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/community-leader/community
 * Full details of the leader's community.
 * 
 * UPDATED: Also handles legacy case where user created verified community
 * but communityId wasn't set on profile (from before auto-assignment was added).
 */
export const getMyCommunity = asyncHandler(async (req, res) => {
    let communityId = req.communityId;

    // ── Legacy Support: If no communityId set, find verified communities created by this user
    if (!communityId) {
        const createdCommunities = await Community.find({
            createdBy: req.userId,
            verificationStatus: "verified",
            status: "active"
        });

        if (createdCommunities.length > 0) {
            // Found a verified community that user created
            const community = createdCommunities[0];
            communityId = community._id;

            // Update user profile to set communityId and role
            await User.findByIdAndUpdate(req.userId, {
                $set: {
                    communityId: community._id,
                    communityRole: "leader"
                }
            });

            console.log(`[Legacy Fix] User ${req.userId} auto-assigned to community ${community._id}`);
        } else {
            // No verified community found
            return res.status(403).json({
                success: false,
                message: "Access denied. No community leadership has been assigned to your account, and no verified community created by you was found.",
            });
        }
    }

    const community = await Community.findById(communityId)
        .populate("createdBy", "name email")
        .populate("currentLeaderId", "name email phone")
        .lean();

    if (!community) {
        return res.status(404).json({
            success: false,
            message: "Community not found.",
        });
    }

    res.status(200).json(new ApiResponse(200, "Community details fetched", { community }));
});

/**
 * PUT /api/community-leader/community
 * Update limited fields of the community (leader cannot change GPS or verification status).
 * Body: { description, address, pincode, tags, population, coverImageKey }
 */
export const updateMyCommunity = asyncHandler(async (req, res) => {
    const allowed = ["description", "address", "pincode", "tags", "population", "coverImageKey"];
    const updates = {};

    for (const key of allowed) {
        if (req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided for update", "EMPTY_UPDATE");
    }

    const community = await Community.findByIdAndUpdate(
        req.communityId,
        { $set: updates },
        { new: true, runValidators: true }
    );

    res.status(200).json(new ApiResponse(200, "Community updated", { community }));
});

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/community-leader/members
 * All responsibilities (members) in the leader's community.
 */
export const getCommunityMembers = asyncHandler(async (req, res) => {
    const { status = "active", role, page = 1, limit = 20 } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(50, parseInt(limit));

    const filter = { communityId: req.communityId };
    if (status) filter.status = status;
    if (role)   filter.role   = role;

    const [members, total] = await Promise.all([
        CommunityResponsibility.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Math.min(50, parseInt(limit)))
            .populate("takenBy", "name email phone avatar")
            .populate("takenByNgoId", "ngoName email phone")
            .lean(),
        CommunityResponsibility.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Members fetched", {
            members,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / Math.min(50, parseInt(limit))),
            },
        })
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/community-leader/activities
 * Create a new activity for the community.
 * Body: { title, description, activityType, plannedDate, specificLocation,
 *         beneficiariesCount, volunteersCount }
 */
export const createActivity = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        activityType,
        plannedDate,
        specificLocation,
        beneficiariesCount,
        volunteersCount,
        responsibilityId,
    } = req.body;

    if (!title || !activityType || !plannedDate) {
        throw new ApiError(400, "title, activityType, and plannedDate are required", "MISSING_FIELDS");
    }

    const validTypes = [
        "cleanup", "medical_camp", "education", "food_distribution",
        "infrastructure", "awareness", "tree_plantation", "skill_development",
        "sanitation", "women_empowerment", "child_welfare", "other",
    ];
    if (!validTypes.includes(activityType)) {
        throw new ApiError(400, `activityType must be one of: ${validTypes.join(", ")}`, "INVALID_TYPE");
    }

    const date = new Date(plannedDate);
    if (isNaN(date.getTime())) {
        throw new ApiError(400, "Invalid plannedDate format", "INVALID_DATE");
    }

    // Validate optional responsibilityId
    if (responsibilityId) {
        if (!mongoose.Types.ObjectId.isValid(responsibilityId)) {
            throw new ApiError(400, "Invalid responsibilityId", "INVALID_ID");
        }
        const resp = await CommunityResponsibility.findOne({
            _id: responsibilityId,
            communityId: req.communityId,
        });
        if (!resp) {
            throw new ApiError(404, "Responsibility not found in this community", "NOT_FOUND");
        }
    }

    const activity = await CommunityActivity.create({
        communityId:      req.communityId,
        responsibilityId: responsibilityId || null,
        title:            title.trim(),
        description:      description?.trim() || "",
        activityType,
        plannedDate:      date,
        specificLocation: specificLocation?.trim() || "",
        beneficiariesCount: beneficiariesCount || 0,
        volunteersCount:    volunteersCount    || 0,
        conductedBy:      req.userId,
        conductedByName:  req.user?.name || "",
        conductedByNgoId: req.user?.ngoId || null,
        status:           "planned",
    });

    // Update community stats
    await Community.findByIdAndUpdate(req.communityId, {
        $inc: { "stats.totalActivities": 1 },
    });

    res.status(201).json(new ApiResponse(201, "Activity created", { activity }));
});

/**
 * GET /api/community-leader/activities
 * All activities in the leader's community (with filters).
 */
export const getLeaderActivities = asyncHandler(async (req, res) => {
    const { status, activityType, page = 1, limit = 15 } = req.query;
    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(50, parseInt(limit));

    const filter = { communityId: req.communityId };
    if (status)       filter.status       = status;
    if (activityType) filter.activityType = activityType;

    const [activities, total] = await Promise.all([
        CommunityActivity.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Math.min(50, parseInt(limit)))
            .populate("conductedBy", "name email")
            .lean(),
        CommunityActivity.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Activities fetched", {
            activities,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / Math.min(50, parseInt(limit))),
            },
        })
    );
});

/**
 * GET /api/community-leader/activities/:id
 * Get a single activity detail.
 */
export const getActivityById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid activity ID", "INVALID_ID");
    }

    const activity = await CommunityActivity.findOne({
        _id: id,
        communityId: req.communityId,
    })
        .populate("conductedBy", "name email phone")
        .populate("verifiedBy", "name")
        .lean();

    if (!activity) {
        throw new ApiError(404, "Activity not found in your community", "NOT_FOUND");
    }

    res.status(200).json(new ApiResponse(200, "Activity fetched", { activity }));
});

/**
 * PUT /api/community-leader/activities/:id
 * Update an activity (only if not yet admin-verified).
 * Body: { title, description, activityType, plannedDate, specificLocation,
 *         beneficiariesCount, volunteersCount, status, leaderFeedback }
 */
export const updateActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid activity ID", "INVALID_ID");
    }

    const activity = await CommunityActivity.findOne({
        _id: id,
        communityId: req.communityId,
    });

    if (!activity) {
        throw new ApiError(404, "Activity not found in your community", "NOT_FOUND");
    }

    if (activity.adminVerified) {
        throw new ApiError(403, "Cannot update an activity that has already been verified by admin", "ALREADY_VERIFIED");
    }

    const allowed = [
        "title", "description", "activityType", "plannedDate",
        "specificLocation", "beneficiariesCount", "volunteersCount", "leaderFeedback",
    ];

    for (const key of allowed) {
        if (req.body[key] !== undefined) {
            activity[key] = req.body[key];
        }
    }

    await activity.save();

    res.status(200).json(new ApiResponse(200, "Activity updated", { activity }));
});

/**
 * PUT /api/community-leader/activities/:id/start
 * Mark activity as ongoing.
 */
export const startActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid activity ID", "INVALID_ID");
    }

    const activity = await CommunityActivity.findOne({
        _id: id,
        communityId: req.communityId,
        status: "planned",
    });

    if (!activity) {
        throw new ApiError(404, "Planned activity not found in your community", "NOT_FOUND");
    }

    activity.status = "ongoing";
    await activity.save();

    res.status(200).json(new ApiResponse(200, "Activity marked as ongoing", { activity }));
});

/**
 * PUT /api/community-leader/activities/:id/complete
 * Mark activity as completed. Leader provides completion note and media.
 * Body: { completionNote, mediaKeys[], mediaThumbnailKey, beneficiariesCount, volunteersCount }
 */
export const completeActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { completionNote, mediaKeys, mediaThumbnailKey, beneficiariesCount, volunteersCount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid activity ID", "INVALID_ID");
    }

    const activity = await CommunityActivity.findOne({
        _id: id,
        communityId: req.communityId,
        status: { $in: ["planned", "ongoing"] },
    });

    if (!activity) {
        throw new ApiError(404, "Activity not found or already completed/cancelled", "NOT_FOUND");
    }

    activity.status           = "completed";
    activity.completedDate    = new Date();
    activity.completionNote   = completionNote?.trim() || "";
    activity.mediaKeys        = Array.isArray(mediaKeys) ? mediaKeys : [];
    activity.mediaThumbnailKey = mediaThumbnailKey || null;
    if (beneficiariesCount !== undefined) activity.beneficiariesCount = beneficiariesCount;
    if (volunteersCount    !== undefined) activity.volunteersCount    = volunteersCount;

    await activity.save();

    // Update community stats
    await Community.findByIdAndUpdate(req.communityId, {
        $inc: { "stats.completedActivities": 1 },
    });

    res.status(200).json(new ApiResponse(200, "Activity marked as completed. Pending admin verification.", { activity }));
});

/**
 * DELETE /api/community-leader/activities/:id
 * Cancel (soft-delete) a planned/ongoing activity.
 */
export const cancelActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid activity ID", "INVALID_ID");
    }

    const activity = await CommunityActivity.findOne({
        _id: id,
        communityId: req.communityId,
        status: { $in: ["planned", "ongoing"] },
    });

    if (!activity) {
        throw new ApiError(404, "Activity not found or cannot be cancelled", "NOT_FOUND");
    }

    activity.status = "cancelled";
    await activity.save();

    res.status(200).json(new ApiResponse(200, "Activity cancelled", { activity }));
});
