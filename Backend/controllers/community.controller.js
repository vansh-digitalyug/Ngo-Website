import mongoose from "mongoose";
import Community from "../models/community.model.js";
import CommunityResponsibility from "../models/communityResponsibility.model.js";
import CommunityActivity from "../models/communityActivity.model.js";
import User from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the MongoDB filter object from query params.
 * Supports text search, geo search (lat/lng), and field filters.
 * NOTE: $near and $text cannot be combined in MongoDB — geo takes priority.
 */
const buildSearchFilter = (query) => {
    const {
        search,
        state,
        district,
        city,
        areaType,
        verificationStatus,
        status,
        lat,
        lng,
        maxDistance,
    } = query;

    const filter = {};

    // ── Geo search ($near requires 2dsphere index) ────────────────────────────
    if (lat && lng) {
        const longitude = parseFloat(lng);
        const latitude  = parseFloat(lat);
        const radius    = parseInt(maxDistance) || 10000; // default 10 km

        if (isNaN(longitude) || isNaN(latitude)) {
            throw new ApiError(400, "lat and lng must be valid numbers", "INVALID_COORDINATES");
        }

        filter.location = {
            $near: {
                $geometry: { type: "Point", coordinates: [longitude, latitude] },
                $maxDistance: radius,
            },
        };
    }

    // ── Text search (only when no geo — they conflict) ─────────────────────
    if (search && !lat && !lng) {
        filter.$text = { $search: search };
    }

    // ── Location filters ──────────────────────────────────────────────────────
    if (state)    filter.state    = { $regex: state,    $options: "i" };
    if (district) filter.district = { $regex: district, $options: "i" };
    if (city)     filter.city     = { $regex: city,     $options: "i" };

    // ── Type / status filters ─────────────────────────────────────────────────
    if (areaType)           filter.areaType           = areaType;
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    // Public-facing routes always show only active communities (can be overridden for admin)
    filter.status = status || "active";

    return filter;
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/community
 * Search & list communities with pagination.
 * Supports: text search, geo search, state/district/city/areaType filters.
 */
export const getCommunities = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const skip  = (page - 1) * limit;

    const filter = buildSearchFilter(req.query);

    // Build sort: score for text search, distance for geo (implicit with $near), createdAt otherwise
    let sort = { createdAt: -1 };
    if (req.query.search && !req.query.lat) {
        sort = { score: { $meta: "textScore" }, createdAt: -1 };
    }

    const projection = req.query.search && !req.query.lat
        ? { score: { $meta: "textScore" } }
        : {};

    const [communities, total] = await Promise.all([
        Community.find(filter, projection)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate("currentLeaderId", "name email")
            .lean(),
        Community.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Communities fetched successfully", {
            communities,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit,
            },
        })
    );
});

/**
 * GET /api/community/nearby
 * Find communities near a GPS point (required: lat, lng; optional: maxDistance in metres).
 */
export const getNearbyCommunities = asyncHandler(async (req, res) => {
    const { lat, lng, maxDistance, limit } = req.query;

    if (!lat || !lng) {
        throw new ApiError(400, "lat and lng query params are required", "MISSING_COORDINATES");
    }

    const longitude = parseFloat(lng);
    const latitude  = parseFloat(lat);
    const radius    = parseInt(maxDistance) || 10000;
    const resultLimit = Math.min(50, parseInt(limit) || 20);

    if (isNaN(longitude) || isNaN(latitude)) {
        throw new ApiError(400, "lat and lng must be valid numbers", "INVALID_COORDINATES");
    }

    const communities = await Community.find({
        status: "active",
        verificationStatus: "verified",
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [longitude, latitude] },
                $maxDistance: radius,
            },
        },
    })
        .limit(resultLimit)
        .populate("currentLeaderId", "name email")
        .lean();

    res.status(200).json(
        new ApiResponse(200, "Nearby communities fetched", {
            communities,
            searchParams: { latitude, longitude, maxDistanceMetres: radius },
        })
    );
});

/**
 * GET /api/community/:id
 * Get full details of a single community.
 */
export const getCommunityById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid community ID", "INVALID_ID");
    }

    const community = await Community.findById(id)
        .populate("createdBy", "name email")
        .populate("currentLeaderId", "name email phone")
        .lean();

    if (!community) {
        throw new ApiError(404, "Community not found", "NOT_FOUND");
    }

    if (community.status !== "active") {
        throw new ApiError(403, "This community is currently inactive", "COMMUNITY_INACTIVE");
    }

    // Active responsibilities count
    const activeResponsibilities = await CommunityResponsibility.find({
        communityId: id,
        status: "active",
    })
        .select("takenByName takenByType role")
        .lean();

    res.status(200).json(
        new ApiResponse(200, "Community details fetched", {
            community,
            activeResponsibilities,
        })
    );
});

/**
 * GET /api/community/:id/activities
 * Public feed of verified completed activities for a community.
 */
export const getCommunityActivities = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid community ID", "INVALID_ID");
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const filter = {
        communityId: id,
        status: "completed",
        adminVerified: true,
    };

    if (req.query.activityType) filter.activityType = req.query.activityType;

    const [activities, total] = await Promise.all([
        CommunityActivity.find(filter)
            .sort({ completedDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate("conductedBy", "name")
            .lean(),
        CommunityActivity.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Activities fetched", {
            activities,
            pagination: { total, page, pages: Math.ceil(total / limit), limit },
        })
    );
});

/**
 * GET /api/community/:id/stats
 * Public statistics for a community.
 */
export const getCommunityStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid community ID", "INVALID_ID");
    }

    const community = await Community.findById(id).select("stats name areaType city state").lean();
    if (!community) throw new ApiError(404, "Community not found", "NOT_FOUND");

    // Activity breakdown by type
    const activityBreakdown = await CommunityActivity.aggregate([
        { $match: { communityId: new mongoose.Types.ObjectId(id), status: "completed", adminVerified: true } },
        { $group: { _id: "$activityType", count: { $sum: 1 }, totalBeneficiaries: { $sum: "$beneficiariesCount" } } },
        { $sort: { count: -1 } },
    ]);

    res.status(200).json(
        new ApiResponse(200, "Community stats fetched", {
            community,
            activityBreakdown,
        })
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATED ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/community
 * Register a new community (user or NGO).
 * Body: { name, areaType, description, address, pincode, city, district, state,
 *         location: { coordinates: [lng, lat] }, population, tags }
 */
export const createCommunity = asyncHandler(async (req, res) => {
    const {
        name,
        areaType,
        description,
        address,
        pincode,
        city,
        district,
        state,
        location,
        population,
        tags,
        coverImageKey,
    } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!name || !areaType || !city || !district || !state) {
        throw new ApiError(400, "name, areaType, city, district, and state are required", "MISSING_FIELDS");
    }

    if (!location || !location.coordinates || location.coordinates.length !== 2) {
        throw new ApiError(400, "GPS location with [longitude, latitude] coordinates is required", "MISSING_LOCATION");
    }

    // Parse and validate coordinates strictly - handle both string and number inputs
    let lng = location.coordinates[0];
    let lat = location.coordinates[1];

    // Log the received values for debugging
    console.log(`[Community Register] Received coordinates - lng: ${lng} (${typeof lng}), lat: ${lat} (${typeof lat})`);

    // Convert to numbers if they're strings
    if (typeof lng === 'string') {
        lng = parseFloat(lng);
    }
    if (typeof lat === 'string') {
        lat = parseFloat(lat);
    }

    // Validate that coordinates are valid numbers
    if (!Number.isFinite(lng)) {
        throw new ApiError(400, `Longitude must be a valid number. Received: ${location.coordinates[0]}`, "INVALID_COORDINATES");
    }
    if (!Number.isFinite(lat)) {
        throw new ApiError(400, `Latitude must be a valid number. Received: ${location.coordinates[1]}`, "INVALID_COORDINATES");
    }

    // Validate ranges
    if (lng < -180 || lng > 180) {
        throw new ApiError(400, `Invalid longitude: ${lng}. Must be between -180 and 180`, "INVALID_COORDINATES");
    }
    if (lat < -90 || lat > 90) {
        throw new ApiError(400, `Invalid latitude: ${lat}. Must be between -90 and 90`, "INVALID_COORDINATES");
    }

    // ── Check for duplicate nearby community (within 500m) ────────────────────
    const nearby = await Community.findOne({
        status: "active",
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: [lng, lat] },
                $maxDistance: 500,
            },
        },
        name: { $regex: `^${name.trim()}$`, $options: "i" },
    });

    if (nearby) {
        throw new ApiError(409, "A community with this name already exists within 500 metres of this location", "DUPLICATE_COMMUNITY");
    }

    // Convert population to number safely
    let populationNum = null;
    if (population) {
        const parsed = parseInt(population, 10);
        populationNum = !isNaN(parsed) && parsed >= 0 ? parsed : null;
    }

    const community = await Community.create({
        name: name.trim(),
        areaType,
        description: description?.trim() || "",
        address:     address?.trim()     || "",
        pincode:     pincode?.trim()     || "",
        city:        city.trim(),
        district:    district.trim(),
        state:       state.trim(),
        location: {
            type: "Point",
            coordinates: [lng, lat],
        },
        population: populationNum,
        tags:        Array.isArray(tags) ? tags.map((t) => t.trim().toLowerCase()) : [],
        createdBy:   req.userId,
        createdByNgoId: req.user?.ngoId || null,
        ...(coverImageKey ? { coverImageKey } : {}),
    });

    res.status(201).json(
        new ApiResponse(201, "Community registered successfully. Pending admin verification.", {
            community,
        })
    );
});

/**
 * POST /api/community/:id/responsibility
 * Take responsibility of a community (user or NGO).
 * Body: { role, responsibilities[], motivation }
 */
export const takeResponsibility = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role = "volunteer", responsibilities = [], motivation = "" } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid community ID", "INVALID_ID");
    }

    const community = await Community.findById(id);
    if (!community) throw new ApiError(404, "Community not found", "NOT_FOUND");

    if (community.verificationStatus !== "verified") {
        throw new ApiError(403, "You can only take responsibility of a verified community", "COMMUNITY_NOT_VERIFIED");
    }
    if (community.status !== "active") {
        throw new ApiError(403, "This community is inactive", "COMMUNITY_INACTIVE");
    }

    // ── Check for existing pending or active responsibility ────────────────────
    const existing = await CommunityResponsibility.findOne({
        communityId: id,
        takenBy: req.userId,
        status: { $in: ["pending", "active"] },
    });

    if (existing) {
        throw new ApiError(409, `You already have a ${existing.status} responsibility in this community`, "ALREADY_EXISTS");
    }

    // ── Validate role ─────────────────────────────────────────────────────────
    const validRoles = ["leader", "co-leader", "coordinator", "volunteer"];
    if (!validRoles.includes(role)) {
        throw new ApiError(400, `Role must be one of: ${validRoles.join(", ")}`, "INVALID_ROLE");
    }

    const user = await User.findById(req.userId).select("name email phone ngoId").lean();

    const responsibility = await CommunityResponsibility.create({
        communityId:   id,
        takenBy:       req.userId,
        takenByNgoId:  user.ngoId || null,
        takenByType:   user.ngoId ? "ngo" : "user",
        takenByName:   user.name,
        takenByEmail:  user.email,
        takenByPhone:  user.phone || null,
        role,
        responsibilities: responsibilities.slice(0, 10), // max 10 items
        motivation:    motivation.trim(),
        status:        "pending",
    });

    // Update community stats
    await Community.findByIdAndUpdate(id, {
        $inc: { "stats.totalResponsibilities": 1 },
    });

    res.status(201).json(
        new ApiResponse(201, "Responsibility request submitted. Awaiting admin approval.", {
            responsibility,
        })
    );
});

/**
 * GET /api/community/my/responsibilities
 * Get the logged-in user's responsibility records across all communities.
 */
export const getMyResponsibilities = asyncHandler(async (req, res) => {
    const responsibilities = await CommunityResponsibility.find({
        takenBy: req.userId,
    })
        .sort({ createdAt: -1 })
        .populate("communityId", "name areaType city state verificationStatus status")
        .lean();

    res.status(200).json(
        new ApiResponse(200, "Your responsibilities fetched", { responsibilities })
    );
});

/**
 * PUT /api/community/responsibilities/:id/report
 * User submits a completion report for their responsibility.
 */
export const submitCompletionReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { completionReport } = req.body;

    if (!completionReport?.trim()) {
        throw new ApiError(400, "completionReport is required", "MISSING_FIELD");
    }

    const responsibility = await CommunityResponsibility.findOne({
        _id: id,
        takenBy: req.userId,
        status: "active",
    });

    if (!responsibility) {
        throw new ApiError(404, "Active responsibility not found", "NOT_FOUND");
    }

    responsibility.completionReport = completionReport.trim();
    responsibility.completedAt = new Date();
    await responsibility.save();

    res.status(200).json(
        new ApiResponse(200, "Completion report submitted", { responsibility })
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITY ACTIVITIES — USER SIDE
// ─────────────────────────────────────────────────────────────────────────────

const VALID_ACTIVITY_TYPES = [
    "cleanup", "medical_camp", "education", "food_distribution",
    "infrastructure", "awareness", "tree_plantation", "skill_development",
    "sanitation", "women_empowerment", "child_welfare", "other",
];

/**
 * POST /api/community/:id/activities
 * Create a new activity (must have an active/pending responsibility in the community OR be an admin).
 */
export const createCommunityActivity = asyncHandler(async (req, res) => {
    const { id: communityId } = req.params;
    const {
        title, description, activityType, plannedDate,
        specificLocation, beneficiariesCount, volunteersCount,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(communityId)) {
        throw new ApiError(400, "Invalid community ID", "INVALID_ID");
    }
    if (!title?.trim()) throw new ApiError(400, "title is required", "MISSING_FIELD");
    if (!activityType || !VALID_ACTIVITY_TYPES.includes(activityType)) {
        throw new ApiError(400, `activityType must be one of: ${VALID_ACTIVITY_TYPES.join(", ")}`, "INVALID_TYPE");
    }
    if (!plannedDate) throw new ApiError(400, "plannedDate is required", "MISSING_FIELD");

    const community = await Community.findById(communityId);
    if (!community) throw new ApiError(404, "Community not found", "NOT_FOUND");
    if (community.status !== "active") throw new ApiError(403, "Community is not active", "COMMUNITY_INACTIVE");

    // Check user has some responsibility in this community
    // OR is the assigned community leader (auto-assigned when admin verified the community,
    // which sets user.communityId but does not create a CommunityResponsibility record)
    const hasResponsibility = await CommunityResponsibility.findOne({
        communityId,
        takenBy: req.userId,
        status: { $in: ["active", "pending"] },
    });
    const isAssignedLeader = community.currentLeaderId?.toString() === req.userId?.toString();
    if (!hasResponsibility && !isAssignedLeader) {
        throw new ApiError(403, "You must have an active or pending responsibility in this community to post activities", "NO_RESPONSIBILITY");
    }

    const user = await User.findById(req.userId).select("name ngoId").lean();

    const activity = await CommunityActivity.create({
        communityId,
        title:              title.trim(),
        description:        description?.trim() || "",
        activityType,
        plannedDate:        new Date(plannedDate),
        specificLocation:   specificLocation?.trim() || "",
        beneficiariesCount: parseInt(beneficiariesCount) || 0,
        volunteersCount:    parseInt(volunteersCount)    || 0,
        conductedBy:        req.userId,
        conductedByName:    user.name,
        conductedByNgoId:   user.ngoId || null,
        status:             "planned",
    });

    // Update community stats
    await Community.findByIdAndUpdate(communityId, {
        $inc: { "stats.totalActivities": 1 },
    });

    res.status(201).json(new ApiResponse(201, "Activity created successfully", { activity }));
});

/**
 * GET /api/community/activities/:actId
 * Get a single activity by ID.
 */
export const getActivityById = asyncHandler(async (req, res) => {
    const { actId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(actId)) throw new ApiError(400, "Invalid activity ID", "INVALID_ID");

    const activity = await CommunityActivity.findById(actId)
        .populate("communityId", "name areaType city state verificationStatus status")
        .populate("conductedBy", "name email")
        .populate("verifiedBy", "name")
        .lean();

    if (!activity) throw new ApiError(404, "Activity not found", "NOT_FOUND");

    res.status(200).json(new ApiResponse(200, "Activity fetched", { activity }));
});

/**
 * GET /api/community/:id/activities/all
 * Get ALL activities for a community (any status) — for the community leader view.
 * Requires active responsibility in the community.
 */
export const getAllActivitiesForCommunity = asyncHandler(async (req, res) => {
    const { id: communityId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(communityId)) throw new ApiError(400, "Invalid community ID", "INVALID_ID");

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = { communityId };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.activityType) filter.activityType = req.query.activityType;

    const [activities, total] = await Promise.all([
        CommunityActivity.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("conductedBy", "name email")
            .lean(),
        CommunityActivity.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Activities fetched", {
            activities,
            pagination: { total, page, pages: Math.ceil(total / limit), limit },
        })
    );
});

/**
 * PUT /api/community/activities/:actId
 * Update activity details (conductor only, only if planned/ongoing).
 */
export const updateCommunityActivity = asyncHandler(async (req, res) => {
    const { actId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(actId)) throw new ApiError(400, "Invalid activity ID", "INVALID_ID");

    const activity = await CommunityActivity.findOne({ _id: actId, conductedBy: req.userId });
    if (!activity) throw new ApiError(404, "Activity not found or you are not the conductor", "NOT_FOUND");
    if (activity.status === "completed" || activity.status === "cancelled") {
        throw new ApiError(403, "Cannot edit a completed or cancelled activity", "INVALID_STATE");
    }

    const { title, description, activityType, plannedDate, specificLocation, beneficiariesCount, volunteersCount, status } = req.body;

    if (title)            activity.title           = title.trim();
    if (description !== undefined) activity.description = description.trim();
    if (activityType && VALID_ACTIVITY_TYPES.includes(activityType)) activity.activityType = activityType;
    if (plannedDate)      activity.plannedDate      = new Date(plannedDate);
    if (specificLocation !== undefined) activity.specificLocation = specificLocation.trim();
    if (beneficiariesCount !== undefined) activity.beneficiariesCount = parseInt(beneficiariesCount) || 0;
    if (volunteersCount   !== undefined) activity.volunteersCount    = parseInt(volunteersCount)    || 0;
    if (status && ["planned", "ongoing", "cancelled"].includes(status)) activity.status = status;

    await activity.save();
    res.status(200).json(new ApiResponse(200, "Activity updated", { activity }));
});

/**
 * PUT /api/community/activities/:actId/complete
 * Mark activity as completed (conductor only).
 * Body: { completionNote, beneficiariesCount, volunteersCount }
 */
export const completeCommunityActivity = asyncHandler(async (req, res) => {
    const { actId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(actId)) throw new ApiError(400, "Invalid activity ID", "INVALID_ID");

    const activity = await CommunityActivity.findOne({ _id: actId, conductedBy: req.userId });
    if (!activity) throw new ApiError(404, "Activity not found or you are not the conductor", "NOT_FOUND");
    if (activity.status === "completed") throw new ApiError(409, "Activity already completed", "ALREADY_COMPLETED");
    if (activity.status === "cancelled") throw new ApiError(403, "Cannot complete a cancelled activity", "INVALID_STATE");

    const { completionNote, beneficiariesCount, volunteersCount } = req.body;

    activity.status        = "completed";
    activity.completedDate = new Date();
    if (completionNote)         activity.completionNote    = completionNote.trim();
    if (beneficiariesCount !== undefined) activity.beneficiariesCount = parseInt(beneficiariesCount) || 0;
    if (volunteersCount    !== undefined) activity.volunteersCount    = parseInt(volunteersCount)    || 0;

    await activity.save();

    // Update community stats
    await Community.findByIdAndUpdate(activity.communityId, {
        $inc: { "stats.completedActivities": 1 },
    });

    res.status(200).json(new ApiResponse(200, "Activity marked as completed. Awaiting admin verification.", { activity }));
});

/**
 * DELETE /api/community/activities/:actId
 * Delete activity (conductor only, only if not completed).
 */
export const deleteCommunityActivity = asyncHandler(async (req, res) => {
    const { actId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(actId)) throw new ApiError(400, "Invalid activity ID", "INVALID_ID");

    const activity = await CommunityActivity.findOne({ _id: actId, conductedBy: req.userId });
    if (!activity) throw new ApiError(404, "Activity not found or you are not the conductor", "NOT_FOUND");
    if (activity.status === "completed") {
        throw new ApiError(403, "Cannot delete a completed activity", "INVALID_STATE");
    }

    await CommunityActivity.findByIdAndDelete(actId);

    await Community.findByIdAndUpdate(activity.communityId, {
        $inc: { "stats.totalActivities": -1 },
    });

    res.status(200).json(new ApiResponse(200, "Activity deleted", null));
});

/**
 * GET /api/community/my/activities
 * Get all activities posted by the logged-in user across all communities.
 */
export const getMyActivities = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = { conductedBy: req.userId };
    if (req.query.status) filter.status = req.query.status;

    const [activities, total] = await Promise.all([
        CommunityActivity.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("communityId", "name areaType city state verificationStatus")
            .lean(),
        CommunityActivity.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Your activities fetched", {
            activities,
            pagination: { total, page, pages: Math.ceil(total / limit), limit },
        })
    );
});
