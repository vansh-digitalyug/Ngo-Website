import mongoose from "mongoose";
import Report from "../models/report.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// ─────────────────────────────────────────────────────────────────────────────
// USER ROUTES  (authenticated)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/report
 * Submit a report. Requires authentication (accountability).
 *
 * Body: { reportType, subject, description, severity?,
 *         targetId?, targetName?, targetModel?, evidenceUrls? }
 */
export const submitReport = asyncHandler(async (req, res) => {
    const {
        reportType,
        subject,
        description,
        severity,
        targetId,
        targetName,
        targetModel,
        evidenceUrls,
    } = req.body;

    // ── Required fields ────────────────────────────────────────────────────────
    if (!reportType || !subject || !description) {
        throw new ApiError(400, "reportType, subject, and description are required", "MISSING_FIELDS");
    }

    const validTypes = ["ngo", "volunteer", "community", "community_activity", "user", "content", "other"];
    if (!validTypes.includes(reportType)) {
        throw new ApiError(400, `reportType must be one of: ${validTypes.join(", ")}`, "INVALID_TYPE");
    }

    const validSeverities = ["low", "medium", "high", "critical"];
    if (severity && !validSeverities.includes(severity)) {
        throw new ApiError(400, `severity must be one of: ${validSeverities.join(", ")}`, "INVALID_SEVERITY");
    }

    if (String(description).trim().length < 20) {
        throw new ApiError(400, "description must be at least 20 characters", "TOO_SHORT");
    }

    if (targetId && !mongoose.Types.ObjectId.isValid(targetId)) {
        throw new ApiError(400, "Invalid targetId", "INVALID_ID");
    }

    const validModels = ["Ngo", "Volunteer", "Community", "CommunityActivity", "User"];
    if (targetModel && !validModels.includes(targetModel)) {
        throw new ApiError(400, `targetModel must be one of: ${validModels.join(", ")}`, "INVALID_MODEL");
    }

    // ── Prevent duplicate pending/under_review reports on same target by same user ─
    if (targetId) {
        const duplicate = await Report.findOne({
            reportedBy: req.userId,
            targetId,
            status:     { $in: ["pending", "under_review"] },
        });

        if (duplicate) {
            throw new ApiError(409, "You have already submitted a report on this item that is still under review", "DUPLICATE_REPORT");
        }
    }

    const report = await Report.create({
        reportedBy:    req.userId,
        reporterName:  req.user.name,
        reporterEmail: req.user.email,
        reportType,
        subject:       String(subject).trim(),
        description:   String(description).trim(),
        severity:      severity || "medium",
        targetId:      targetId   || null,
        targetName:    targetName || null,
        targetModel:   targetModel || null,
        evidenceUrls:  Array.isArray(evidenceUrls) ? evidenceUrls.slice(0, 5) : [],
        status:        "pending",
    });

    res.status(201).json(
        new ApiResponse(201, "Report submitted. Our team will review it shortly.", {
            reportId: report._id,
        })
    );
});

/**
 * GET /api/report/my
 * Logged-in user sees their own submitted reports (without adminNote/actionTaken).
 * Query: page, limit
 */
export const getMyReports = asyncHandler(async (req, res) => {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [reports, total] = await Promise.all([
        Report.find({ reportedBy: req.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("-adminNote")   // private — hide from reporter
            .lean(),
        Report.countDocuments({ reportedBy: req.userId }),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Your reports fetched", {
            reports,
            pagination: { total, page, pages: Math.ceil(total / limit), limit },
        })
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/reports/stats
 * Sidebar badge counts — critical/high reports are flagged urgently.
 *
 * Returns: total, byStatus, byType, bySeverity, urgent (critical + high + pending)
 */
export const getReportStats = asyncHandler(async (req, res) => {
    const [statusCounts, typeCounts, severityCounts] = await Promise.all([
        Report.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Report.aggregate([
            { $group: { _id: "$reportType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]),
        Report.aggregate([
            { $group: { _id: "$severity", count: { $sum: 1 } } },
        ]),
    ]);

    const byStatus   = { pending: 0, under_review: 0, resolved: 0, dismissed: 0 };
    const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 };

    statusCounts.forEach(({ _id, count }) => { if (byStatus[_id]   !== undefined) byStatus[_id]   = count; });
    severityCounts.forEach(({ _id, count }) => { if (bySeverity[_id] !== undefined) bySeverity[_id] = count; });

    const total  = Object.values(byStatus).reduce((a, b) => a + b, 0);
    // Sidebar badge = pending + under_review
    const active = byStatus.pending + byStatus.under_review;
    // Urgent = critical or high severity that is still pending/under_review
    const urgent = await Report.countDocuments({
        severity: { $in: ["critical", "high"] },
        status:   { $in: ["pending", "under_review"] },
    });

    res.status(200).json(
        new ApiResponse(200, "Report stats fetched", {
            total,
            active,     // sidebar badge value (unresolved)
            urgent,     // red badge for critical/high priority
            byStatus,
            bySeverity,
            typeBreakdown: typeCounts,
        })
    );
});

/**
 * GET /api/admin/reports
 * Paginated list of all reports with filters.
 * Query: status, reportType, severity, search, page, limit
 * Default sort: critical/high first, then createdAt desc.
 */
export const adminGetAllReports = asyncHandler(async (req, res) => {
    const {
        status,
        reportType,
        severity,
        search,
        page  = 1,
        limit = 15,
    } = req.query;

    const skip    = (Math.max(1, parseInt(page)) - 1) * Math.min(100, parseInt(limit));
    const perPage = Math.min(100, parseInt(limit));
    const filter  = {};

    if (status)     filter.status     = status;
    if (reportType) filter.reportType = reportType;
    if (severity)   filter.severity   = severity;

    if (search) {
        const rx = { $regex: search, $options: "i" };
        filter.$or = [
            { reporterName: rx },
            { reporterEmail: rx },
            { subject: rx },
            { description: rx },
            { targetName: rx },
        ];
    }

    // Severity sort order for the priority queue
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const SEVERITY_SORT = {
        $addFields: {
            severityOrder: {
                $switch: {
                    branches: [
                        { case: { $eq: ["$severity", "critical"] }, then: 0 },
                        { case: { $eq: ["$severity", "high"]     }, then: 1 },
                        { case: { $eq: ["$severity", "medium"]   }, then: 2 },
                        { case: { $eq: ["$severity", "low"]      }, then: 3 },
                    ],
                    default: 4,
                },
            },
        },
    };

    const [reports, total] = await Promise.all([
        Report.aggregate([
            { $match: filter },
            SEVERITY_SORT,
            { $sort: { severityOrder: 1, createdAt: -1 } },
            { $skip: skip },
            { $limit: perPage },
            {
                $lookup: {
                    from: "users",
                    localField: "reportedBy",
                    foreignField: "_id",
                    as: "reportedByUser",
                    pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }],
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "resolvedBy",
                    foreignField: "_id",
                    as: "resolvedByUser",
                    pipeline: [{ $project: { name: 1 } }],
                },
            },
            {
                $addFields: {
                    reportedByUser: { $arrayElemAt: ["$reportedByUser", 0] },
                    resolvedByUser: { $arrayElemAt: ["$resolvedByUser", 0] },
                },
            },
            { $unset: "severityOrder" },
        ]),
        Report.countDocuments(filter),
    ]);

    res.status(200).json(
        new ApiResponse(200, "Reports fetched", {
            reports,
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
 * GET /api/admin/reports/:id
 * Single report detail. Auto-marks as "under_review".
 */
export const adminGetReportById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid report ID", "INVALID_ID");
    }

    const report = await Report.findById(id)
        .populate("reportedBy", "name email phone avatar")
        .populate("resolvedBy", "name email")
        .populate("reviewedBy", "name email");

    if (!report) throw new ApiError(404, "Report not found", "NOT_FOUND");

    // Auto-mark as under_review on first admin open
    if (report.status === "pending") {
        report.status     = "under_review";
        report.reviewedBy = req.userId;
        report.reviewedAt = new Date();
        await report.save();
    }

    res.status(200).json(new ApiResponse(200, "Report fetched", { report }));
});

/**
 * PUT /api/admin/reports/:id/status
 * Update report status, add admin note and action taken.
 * Body: { status, adminNote?, actionTaken? }
 */
export const adminUpdateReportStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, adminNote, actionTaken } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid report ID", "INVALID_ID");
    }

    const validStatuses = ["pending", "under_review", "resolved", "dismissed"];
    if (!status || !validStatuses.includes(status)) {
        throw new ApiError(400, `status must be one of: ${validStatuses.join(", ")}`, "INVALID_STATUS");
    }

    const updates = { status };
    if (adminNote   !== undefined) updates.adminNote   = adminNote;
    if (actionTaken !== undefined) updates.actionTaken = actionTaken;

    if (status === "resolved" || status === "dismissed") {
        updates.resolvedBy = req.userId;
        updates.resolvedAt = new Date();
    }

    if (status === "under_review") {
        updates.reviewedBy = req.userId;
        updates.reviewedAt = new Date();
    }

    const report = await Report.findByIdAndUpdate(id, { $set: updates }, { new: true })
        .populate("reportedBy", "name email")
        .populate("resolvedBy", "name");

    if (!report) throw new ApiError(404, "Report not found", "NOT_FOUND");

    res.status(200).json(new ApiResponse(200, `Report ${status}`, { report }));
});

/**
 * PUT /api/admin/reports/:id/severity
 * Escalate or downgrade report severity.
 * Body: { severity }
 */
export const adminUpdateReportSeverity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { severity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid report ID", "INVALID_ID");
    }

    const validSeverities = ["low", "medium", "high", "critical"];
    if (!severity || !validSeverities.includes(severity)) {
        throw new ApiError(400, `severity must be one of: ${validSeverities.join(", ")}`, "INVALID_SEVERITY");
    }

    const report = await Report.findByIdAndUpdate(id, { $set: { severity } }, { new: true });
    if (!report) throw new ApiError(404, "Report not found", "NOT_FOUND");

    res.status(200).json(new ApiResponse(200, "Report severity updated", { report }));
});

/**
 * DELETE /api/admin/reports/:id
 * Permanently delete a report record.
 */
export const adminDeleteReport = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid report ID", "INVALID_ID");
    }

    const report = await Report.findByIdAndDelete(id);
    if (!report) throw new ApiError(404, "Report not found", "NOT_FOUND");

    res.status(200).json(new ApiResponse(200, "Report deleted", null));
});
