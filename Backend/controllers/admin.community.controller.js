import mongoose from "mongoose";
import Community from "../models/community.model.js";
import CommunityResponsibility from "../models/communityResponsibility.model.js";
import CommunityActivity from "../models/communityActivity.model.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITY MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/communities/stats
 * Overall community platform statistics.
 */
export const getCommunityPlatformStats = asyncHandler(async (req, res) => {
    const [
        total,
        verified,
        pending,
        rejected,
        inactive,
        totalResponsibilities,
        activeResponsibilities,
        totalActivities,
        completedActivities,
        pendingVerification,
        stateBreakdown,
        typeBreakdown,
    ] = await Promise.all([
        Community.countDocuments({}),
        Community.countDocuments({ verificationStatus: "verified" }),
        Community.countDocuments({ verificationStatus: "pending" }),
        Community.countDocuments({ verificationStatus: "rejected" }),
        Community.countDocuments({ status: "inactive" }),
        CommunityResponsibility.countDocuments({}),
        CommunityResponsibility.countDocuments({ status: "active" }),
        CommunityActivity.countDocuments({}),
        CommunityActivity.countDocuments({ status: "completed" }),
        CommunityActivity.countDocuments({ status: "completed", adminVerified: false }),

        // Communities per state
        Community.aggregate([
            { $group: { _id: "$state", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 15 },
        ]),

        // Communities by area type
        Community.aggregate([
            { $group: { _id: "$areaType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Community platform stats fetched", {
            communities: { total, verified, pending, rejected, inactive },
            responsibilities: { total: totalResponsibilities, active: activeResponsibilities },
            activities: { total: totalActivities, completed: completedActivities, pendingVerification },
            stateBreakdown,
            typeBreakdown,
        })
    );
});

/**
 * GET /api/admin/communities
 * List all communities with search, filter, and pagination.
 */
export const adminGetAllCommunities = asyncHandler(async (req, res) => {
    const {
        search,
        state,
        district,
        city,
        areaType,
        verificationStatus,
        status,
        page  = 1,
        limit = 15,
    } = req.query;

    const skip     = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
    const perPage  = Math.min(100, parseInt(limit));
    const filter   = {};

    // Text search
    if (search) filter.$text = { $search: search };

    // Field filters
    if (state)              filter.state              = { $regex: state,    $options: "i" };
    if (district)           filter.district           = { $regex: district, $options: "i" };
    if (city)               filter.city               = { $regex: city,     $options: "i" };
    if (areaType)           filter.areaType           = areaType;
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (status)             filter.status             = status;

    const projection = search ? { score: { $meta: "textScore" } } : {};
    const sort = search ? { score: { $meta: "textScore" }, createdAt: -1 } : { createdAt: -1 };

    const [communities, total] = await Promise.all([
        Community.find(filter, projection)
            .sort(sort)
            .skip(skip)
            .limit(perPage)
            .populate("createdBy", "name email")
            .populate("currentLeaderId", "name email")
            .lean(),
        Community.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Communities fetched", {
            communities,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / perPage),
                limit: perPage,
            },
        })
    );
});

/**
 * GET /api/admin/communities/:id
 * Full community detail with responsibilities and recent activities.
 */
export const adminGetCommunityById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid community ID", "INVALID_ID");
    }

    const [community, responsibilities, recentActivities] = await Promise.all([
        Community.findById(id)
            .populate("createdBy", "name email phone")
            .populate("currentLeaderId", "name email phone")
            .lean(),

        CommunityResponsibility.find({ communityId: id })
            .sort({ createdAt: -1 })
            .populate("takenBy", "name email phone")
            .populate("takenByNgoId", "ngoName email phone")
            .lean(),

        CommunityActivity.find({ communityId: id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("conductedBy", "name email")
            .lean(),
    ]);

    if (!community) throw new ApiError(404, "Community not found", "NOT_FOUND");

    res.status(200).json(
        new ApiResponse(200, "Community detail fetched", {
            community,
            responsibilities,
            recentActivities,
        })
    );
});

/**
 * PUT /api/admin/communities/:id/status
 * Verify, reject, or activate/deactivate a community.
 * Body: { verificationStatus?, status?, adminNote? }
 */
export const adminUpdateCommunityStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { verificationStatus, status, adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid community ID", "INVALID_ID");
    }

    if (!verificationStatus && !status) {
        throw new ApiError(400, "Provide verificationStatus or status to update", "MISSING_FIELDS");
    }

    const updates = {};
    if (verificationStatus) {
        const valid = ["pending", "verified", "rejected"];
        if (!valid.includes(verificationStatus)) {
            throw new ApiError(400, `verificationStatus must be: ${valid.join(", ")}`, "INVALID_STATUS");
        }
        updates.verificationStatus = verificationStatus;
        if (verificationStatus === "rejected") updates.rejectedAt = new Date();
    }

    if (status) {
        const valid = ["active", "inactive"];
        if (!valid.includes(status)) {
            throw new ApiError(400, `status must be: ${valid.join(", ")}`, "INVALID_STATUS");
        }
        updates.status = status;
    }

    if (adminNote !== undefined) updates.adminNote = adminNote;

    const community = await Community.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!community) throw new ApiError(404, "Community not found", "NOT_FOUND");

    res.status(200).json(new ApiResponse(200, "Community status updated", { community }));
});

/**
 * PUT /api/admin/communities/:id/assign-leader
 * Assign a community leader by approving their responsibility and updating user profile.
 * Body: { responsibilityId }
 */
export const adminAssignLeader = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { responsibilityId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(responsibilityId)) {
        throw new ApiError(400, "Invalid ID provided", "INVALID_ID");
    }

    const responsibility = await CommunityResponsibility.findOne({
        _id: responsibilityId,
        communityId: id,
        status: { $in: ["pending", "active"] },
    });

    if (!responsibility) {
        throw new ApiError(404, "Responsibility request not found", "NOT_FOUND");
    }

    // ── Revoke existing active leader (if any) ─────────────────────────────────
    const existingLeader = await CommunityResponsibility.findOne({
        communityId: id,
        role: "leader",
        status: "active",
    });

    if (existingLeader && existingLeader._id.toString() !== responsibilityId) {
        existingLeader.status    = "revoked";
        existingLeader.revokedBy = req.userId;
        existingLeader.revokedAt = new Date();
        existingLeader.revokeReason = "New leader assigned by admin";
        await existingLeader.save();

        // Clear old leader's community assignment
        await User.findByIdAndUpdate(existingLeader.takenBy, {
            $set: { communityId: null, communityRole: null },
        });
    }

    // ── Activate new responsibility ────────────────────────────────────────────
    responsibility.status     = "active";
    responsibility.role       = "leader";
    responsibility.startDate  = new Date();
    responsibility.approvedBy = req.userId;
    responsibility.approvedAt = new Date();
    await responsibility.save();

    // ── Update user profile ────────────────────────────────────────────────────
    await User.findByIdAndUpdate(responsibility.takenBy, {
        $set: {
            communityId:   responsibility.communityId,
            communityRole: "leader",
        },
    });

    // ── Update community's current leader ─────────────────────────────────────
    await Community.findByIdAndUpdate(id, {
        $set: {
            currentLeaderId:  responsibility.takenBy,
            currentLeaderName: responsibility.takenByName,
        },
        $inc: { "stats.activeResponsibilities": 1 },
    });

    res.status(200).json(
        new ApiResponse(200, "Community leader assigned successfully", { responsibility })
    );
});

/**
 * DELETE /api/admin/communities/:id
 * Delete a community and all associated data.
 */
export const adminDeleteCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid community ID", "INVALID_ID");
    }

    const community = await Community.findById(id);
    if (!community) throw new ApiError(404, "Community not found", "NOT_FOUND");

    // Clear communityId from all users linked to this community
    await User.updateMany(
        { communityId: id },
        { $set: { communityId: null, communityRole: null } }
    );

    // Delete related data
    await Promise.all([
        CommunityResponsibility.deleteMany({ communityId: id }),
        CommunityActivity.deleteMany({ communityId: id }),
        Community.findByIdAndDelete(id),
    ]);

    res.status(200).json(new ApiResponse(200, "Community and all related data deleted", null));
});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIBILITY MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/community-responsibilities
 * All responsibility requests across all communities.
 */
export const adminGetAllResponsibilities = asyncHandler(async (req, res) => {
    const {
        status,
        role,
        communityId,
        takenByType,
        page  = 1,
        limit = 15,
    } = req.query;

    const skip    = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
    const perPage = Math.min(100, parseInt(limit));
    const filter  = {};

    if (status)       filter.status       = status;
    if (role)         filter.role         = role;
    if (takenByType)  filter.takenByType  = takenByType;
    if (communityId && mongoose.Types.ObjectId.isValid(communityId)) {
        filter.communityId = communityId;
    }

    const [responsibilities, total] = await Promise.all([
        CommunityResponsibility.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage)
            .populate("communityId", "name areaType city state verificationStatus")
            .populate("takenBy", "name email phone")
            .populate("takenByNgoId", "ngoName email phone")
            .populate("approvedBy", "name")
            .populate("revokedBy", "name")
            .lean(),
        CommunityResponsibility.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Responsibilities fetched", {
            responsibilities,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / perPage),
                limit: perPage,
            },
        })
    );
});

/**
 * PUT /api/admin/community-responsibilities/:id/status
 * Approve, activate, complete, or revoke a responsibility.
 * Body: { status: "active"|"revoked"|"completed", role?, adminNote?, revokeReason? }
 */
export const adminUpdateResponsibilityStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, role, adminNote, revokeReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid responsibility ID", "INVALID_ID");
    }

    const validStatuses = ["active", "revoked", "completed"];
    if (!status || !validStatuses.includes(status)) {
        throw new ApiError(400, `status must be one of: ${validStatuses.join(", ")}`, "INVALID_STATUS");
    }

    const responsibility = await CommunityResponsibility.findById(id);
    if (!responsibility) throw new ApiError(404, "Responsibility not found", "NOT_FOUND");

    const previousStatus = responsibility.status;

    // ── Apply status transitions ────────────────────────────────────────────────
    responsibility.status = status;
    if (adminNote) responsibility.adminNote = adminNote;

    if (status === "active" && previousStatus === "pending") {
        responsibility.approvedBy = req.userId;
        responsibility.approvedAt = new Date();
        responsibility.startDate  = new Date();
        if (role) responsibility.role = role;

        // Grant community dashboard access to the user
        await User.findByIdAndUpdate(responsibility.takenBy, {
            $set: {
                communityId:   responsibility.communityId,
                communityRole: responsibility.role,
            },
        });

        // If leader role, update community's currentLeader
        if (responsibility.role === "leader") {
            await Community.findByIdAndUpdate(responsibility.communityId, {
                $set: {
                    currentLeaderId:   responsibility.takenBy,
                    currentLeaderName: responsibility.takenByName,
                },
            });
        }

        await Community.findByIdAndUpdate(responsibility.communityId, {
            $inc: { "stats.activeResponsibilities": 1 },
        });
    }

    if (status === "revoked") {
        responsibility.revokedBy    = req.userId;
        responsibility.revokedAt    = new Date();
        responsibility.revokeReason = revokeReason || null;

        // Revoke user's community dashboard access
        await User.findByIdAndUpdate(responsibility.takenBy, {
            $set: { communityId: null, communityRole: null },
        });

        // Clear community leader if this was the leader
        if (responsibility.role === "leader") {
            await Community.findByIdAndUpdate(responsibility.communityId, {
                $set: { currentLeaderId: null, currentLeaderName: null },
            });
        }

        if (previousStatus === "active") {
            await Community.findByIdAndUpdate(responsibility.communityId, {
                $inc: { "stats.activeResponsibilities": -1 },
            });
        }
    }

    if (status === "completed") {
        responsibility.completedAt = new Date();
        responsibility.endDate     = new Date();

        if (previousStatus === "active") {
            // Remove dashboard access
            await User.findByIdAndUpdate(responsibility.takenBy, {
                $set: { communityId: null, communityRole: null },
            });

            if (responsibility.role === "leader") {
                await Community.findByIdAndUpdate(responsibility.communityId, {
                    $set: { currentLeaderId: null, currentLeaderName: null },
                });
            }

            await Community.findByIdAndUpdate(responsibility.communityId, {
                $inc: { "stats.activeResponsibilities": -1 },
            });
        }
    }

    await responsibility.save();

    res.status(200).json(
        new ApiResponse(200, `Responsibility ${status} successfully`, { responsibility })
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/community-activities
 * All activities across all communities (admin oversight).
 */
export const adminGetAllActivities = asyncHandler(async (req, res) => {
    const {
        status,
        activityType,
        communityId,
        adminVerified,
        page  = 1,
        limit = 15,
    } = req.query;

    const skip    = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
    const perPage = Math.min(100, parseInt(limit));
    const filter  = {};

    if (status)       filter.status       = status;
    if (activityType) filter.activityType = activityType;
    if (adminVerified !== undefined) filter.adminVerified = adminVerified === "true";
    if (communityId && mongoose.Types.ObjectId.isValid(communityId)) {
        filter.communityId = communityId;
    }

    const [activities, total] = await Promise.all([
        CommunityActivity.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage)
            .populate("communityId", "name areaType city state")
            .populate("conductedBy", "name email")
            .populate("verifiedBy", "name")
            .lean(),
        CommunityActivity.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Activities fetched", {
            activities,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / perPage),
                limit: perPage,
            },
        })
    );
});

/**
 * PUT /api/admin/community-activities/:id/verify
 * Admin verifies (or rejects) a completed activity.
 * Body: { adminVerified: true|false, adminNote? }
 */
export const adminVerifyActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { adminVerified, adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid activity ID", "INVALID_ID");
    }

    if (adminVerified === undefined) {
        throw new ApiError(400, "adminVerified (boolean) is required", "MISSING_FIELD");
    }

    const activity = await CommunityActivity.findOne({ _id: id, status: "completed" });
    if (!activity) {
        throw new ApiError(404, "Completed activity not found", "NOT_FOUND");
    }

    activity.adminVerified = Boolean(adminVerified);
    activity.adminNote     = adminNote || null;
    activity.verifiedBy    = req.userId;
    activity.verifiedAt    = new Date();

    await activity.save();

    res.status(200).json(
        new ApiResponse(
            200,
            adminVerified ? "Activity verified successfully" : "Activity rejected",
            { activity }
        )
    );
});

/**
 * DELETE /api/admin/community-activities/:id
 * Admin deletes an activity record.
 */
export const adminDeleteActivity = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid activity ID", "INVALID_ID");
    }

    const activity = await CommunityActivity.findByIdAndDelete(id);
    if (!activity) throw new ApiError(404, "Activity not found", "NOT_FOUND");

    // Update community stats if completed
    if (activity.status === "completed") {
        await Community.findByIdAndUpdate(activity.communityId, {
            $inc: {
                "stats.totalActivities": -1,
                "stats.completedActivities": -1,
            },
        });
    } else {
        await Community.findByIdAndUpdate(activity.communityId, {
            $inc: { "stats.totalActivities": -1 },
        });
    }

    res.status(200).json(new ApiResponse(200, "Activity deleted", null));
});
