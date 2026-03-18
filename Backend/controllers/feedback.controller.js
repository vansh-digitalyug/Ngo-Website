import mongoose from "mongoose";
import Feedback from "../models/feedback.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC / USER ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/feedback
 * Submit feedback. Works for both anonymous and logged-in users.
 * If logged in, name/email are pulled from the user profile (body fields optional).
 *
 * Body: { name, email, phone?, feedbackType, subject, message,
 *         rating?, targetId?, targetName?, targetModel? }
 */
export const submitFeedback = asyncHandler(async (req, res) => {
    const {
        name,
        email,
        phone,
        feedbackType,
        subject,
        message,
        rating,
        targetId,
        targetName,
        targetModel,
    } = req.body;

    // ── Resolve submitter identity ─────────────────────────────────────────────
    let resolvedName  = String(name  || "").trim();
    let resolvedEmail = String(email || "").trim().toLowerCase();
    let userId        = null;

    if (req.user) {
        // Logged-in: prefer profile data, allow body override
        userId        = req.user._id;
        resolvedName  = resolvedName  || req.user.name;
        resolvedEmail = resolvedEmail || req.user.email;
    }

    if (!resolvedName || !resolvedEmail) {
        throw new ApiError(400, "name and email are required", "MISSING_FIELDS");
    }

    if (!/^\S+@\S+\.\S+$/.test(resolvedEmail)) {
        throw new ApiError(400, "Please enter a valid email address", "INVALID_EMAIL");
    }

    if (!feedbackType || !subject || !message) {
        throw new ApiError(400, "feedbackType, subject, and message are required", "MISSING_FIELDS");
    }

    const validTypes = ["platform", "ngo", "volunteer", "event", "community", "service", "other"];
    if (!validTypes.includes(feedbackType)) {
        throw new ApiError(400, `feedbackType must be one of: ${validTypes.join(", ")}`, "INVALID_TYPE");
    }

    if (rating !== undefined && rating !== null) {
        const r = Number(rating);
        if (isNaN(r) || r < 1 || r > 5) {
            throw new ApiError(400, "rating must be between 1 and 5", "INVALID_RATING");
        }
    }

    // ── Validate targetId if provided ──────────────────────────────────────────
    const validModels = ["Ngo", "Volunteer", "Event", "Community", "Services.Program"];
    if (targetId && !mongoose.Types.ObjectId.isValid(targetId)) {
        throw new ApiError(400, "Invalid targetId", "INVALID_ID");
    }
    if (targetModel && !validModels.includes(targetModel)) {
        throw new ApiError(400, `targetModel must be one of: ${validModels.join(", ")}`, "INVALID_MODEL");
    }

    const feedback = await Feedback.create({
        userId,
        name:        resolvedName,
        email:       resolvedEmail,
        phone:       phone || null,
        feedbackType,
        subject:     String(subject).trim(),
        message:     String(message).trim(),
        rating:      rating != null ? Number(rating) : null,
        targetId:    targetId || null,
        targetName:  targetName || null,
        targetModel: targetModel || null,
        status:      "new",
    });

    res.status(201).json(
        new ApiResponse(201, "Thank you for your feedback!", { feedbackId: feedback._id })
    );
});

/**
 * GET /api/feedback/my
 * Logged-in user sees their own submitted feedback.
 * Query: page, limit
 */
export const getMyFeedback = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [feedbacks, total] = await Promise.all([
        Feedback.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("-adminNote") // hide private admin note
            .lean(),
        Feedback.countDocuments({ userId: req.user._id }),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Your feedback fetched", {
            feedbacks,
            pagination: { total, page, pages: Math.ceil(total / limit), limit },
        })
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/feedback/stats
 * Badge counts for the admin sidebar.
 * Returns: total, new, read, acknowledged, resolved + rating averages + type breakdown
 */
export const getFeedbackStats = asyncHandler(async (req, res) => {
    const [statusCounts, typeBreakdown, ratingStats] = await Promise.all([
        // Count per status
        Feedback.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),

        // Count per feedbackType
        Feedback.aggregate([
            { $group: { _id: "$feedbackType", count: { $sum: 1 }, avgRating: { $avg: "$rating" } } },
            { $sort: { count: -1 } },
        ]),

        // Overall rating stats
        Feedback.aggregate([
            { $match: { rating: { $ne: null } } },
            {
                $group: {
                    _id: null,
                    avgRating:     { $avg: "$rating" },
                    totalRated:    { $sum: 1 },
                    fiveStar:      { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
                    fourStar:      { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
                    threeStar:     { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
                    twoStar:       { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
                    oneStar:       { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
                },
            },
        ]),
    ]);

    // Normalise status counts to a flat object
    const byStatus = { new: 0, read: 0, acknowledged: 0, resolved: 0 };
    statusCounts.forEach(({ _id, count }) => { byStatus[_id] = count; });
    const total = Object.values(byStatus).reduce((a, b) => a + b, 0);

    res.status(200).json(
        new ApiResponse(200, "Feedback stats fetched", {
            total,
            byStatus,           // { new, read, acknowledged, resolved }
            unread: byStatus.new,  // sidebar badge value
            typeBreakdown,
            ratings: ratingStats[0] || { avgRating: null, totalRated: 0 },
        })
    );
});

/**
 * GET /api/admin/feedback
 * Paginated list of all feedback with filters.
 * Query: status, feedbackType, rating, search, page, limit
 */
export const adminGetAllFeedback = asyncHandler(async (req, res) => {
    const {
        status,
        feedbackType,
        rating,
        search,
        page  = 1,
        limit = 15,
    } = req.query;

    const skip    = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
    const perPage = Math.min(100, parseInt(limit));
    const filter  = {};

    if (status)      filter.status      = status;
    if (feedbackType) filter.feedbackType = feedbackType;
    if (rating)      filter.rating      = Number(rating);

    if (search) {
        const rx = { $regex: search, $options: "i" };
        filter.$or = [{ name: rx }, { email: rx }, { subject: rx }, { message: rx }];
    }

    const [feedbacks, total] = await Promise.all([
        Feedback.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage)
            .populate("userId", "name email avatar")
            .populate("repliedBy", "name")
            .lean(),
        Feedback.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Feedback fetched", {
            feedbacks,
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
 * GET /api/admin/feedback/:id
 * Single feedback detail. Auto-marks as "read".
 */
export const adminGetFeedbackById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid feedback ID", "INVALID_ID");
    }

    const feedback = await Feedback.findById(id)
        .populate("userId", "name email phone avatar")
        .populate("repliedBy", "name email");

    if (!feedback) throw new ApiError(404, "Feedback not found", "NOT_FOUND");

    // Auto-mark as read on first admin open
    if (feedback.status === "new") {
        feedback.status = "read";
        feedback.readAt = new Date();
        await feedback.save();
    }

    res.status(200).json(new ApiResponse(200, "Feedback fetched", { feedback }));
});

/**
 * PUT /api/admin/feedback/:id/status
 * Update feedback status and/or add admin note.
 * Body: { status, adminNote? }
 */
export const adminUpdateFeedbackStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid feedback ID", "INVALID_ID");
    }

    const validStatuses = ["new", "read", "acknowledged", "resolved"];
    if (!status || !validStatuses.includes(status)) {
        throw new ApiError(400, `status must be one of: ${validStatuses.join(", ")}`, "INVALID_STATUS");
    }

    const updates = { status };
    if (adminNote !== undefined) updates.adminNote = adminNote;

    const feedback = await Feedback.findByIdAndUpdate(id, { $set: updates }, { new: true });
    if (!feedback) throw new ApiError(404, "Feedback not found", "NOT_FOUND");

    res.status(200).json(new ApiResponse(200, "Feedback status updated", { feedback }));
});

/**
 * PUT /api/admin/feedback/:id/reply
 * Admin replies to a feedback submission.
 * Body: { adminReply, adminNote? }
 */
export const adminReplyToFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { adminReply, adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid feedback ID", "INVALID_ID");
    }

    if (!adminReply || String(adminReply).trim().length < 5) {
        throw new ApiError(400, "adminReply must be at least 5 characters", "MISSING_FIELD");
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) throw new ApiError(404, "Feedback not found", "NOT_FOUND");

    feedback.adminReply = String(adminReply).trim();
    feedback.repliedBy  = req.userId;
    feedback.repliedAt  = new Date();
    feedback.status     = "resolved";
    if (adminNote) feedback.adminNote = adminNote;

    await feedback.save();

    res.status(200).json(new ApiResponse(200, "Reply saved and feedback marked resolved", { feedback }));
});

/**
 * DELETE /api/admin/feedback/:id
 * Permanently delete a feedback record.
 */
export const adminDeleteFeedback = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid feedback ID", "INVALID_ID");
    }

    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) throw new ApiError(404, "Feedback not found", "NOT_FOUND");

    res.status(200).json(new ApiResponse(200, "Feedback deleted", null));
});
