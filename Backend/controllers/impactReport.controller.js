import ImpactReport from "../models/ImpactReport.model.js";

const ok  = (res, data, msg = "Success", code = 200) =>
    res.status(code).json({ success: true, message: msg, data });
const err = (res, msg, code = 500) =>
    res.status(code).json({ success: false, message: msg });

// ── Public ────────────────────────────────────────────────────────────────

export const listPublic = async (req, res) => {
    try {
        const { ngoId, page = 1, limit = 12 } = req.query;
        const filter = { status: "published", isPublic: true };
        if (ngoId) filter.ngoId = ngoId;
        const skip = (Number(page) - 1) * Number(limit);
        const [reports, total] = await Promise.all([
            ImpactReport.find(filter).populate("ngoId", "ngoName logo").populate("villageId", "villageName district state").sort({ periodStart: -1 }).skip(skip).limit(Number(limit)).lean(),
            ImpactReport.countDocuments(filter),
        ]);
        ok(res, { reports, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
    } catch (e) { err(res, e.message); }
};

export const getPublicReport = async (req, res) => {
    try {
        const report = await ImpactReport.findOne({ _id: req.params.id, status: "published", isPublic: true })
            .populate("ngoId", "ngoName logo").populate("villageId", "villageName district state").lean();
        if (!report) return err(res, "Report not found", 404);
        ok(res, { report });
    } catch (e) { err(res, e.message); }
};

// ── NGO ───────────────────────────────────────────────────────────────────

export const getMyReports = async (req, res) => {
    try {
        const reports = await ImpactReport.find({ ngoId: req.ngo._id })
            .populate("villageId", "villageName district").sort({ periodStart: -1 }).lean();
        ok(res, { reports });
    } catch (e) { err(res, e.message); }
};

export const createReport = async (req, res) => {
    try {
        const { title, reportPeriod, periodStart, periodEnd, summary, metrics, highlights, challenges, nextSteps, villageId, status, isPublic } = req.body;
        if (!title?.trim()) return err(res, "Title is required", 400);
        if (!periodStart || !periodEnd) return err(res, "Period start and end are required", 400);

        const report = await ImpactReport.create({
            ngoId: req.ngo._id,
            villageId: villageId || null,
            title: title.trim(),
            reportPeriod: reportPeriod || "monthly",
            periodStart: new Date(periodStart),
            periodEnd: new Date(periodEnd),
            summary: summary?.trim() || "",
            metrics: metrics || [],
            highlights: highlights || [],
            challenges: challenges || [],
            nextSteps: nextSteps || [],
            status: status || "draft",
            isPublic: isPublic === true,
        });
        ok(res, { report }, "Report created", 201);
    } catch (e) { err(res, e.message); }
};

export const updateReport = async (req, res) => {
    try {
        const report = await ImpactReport.findById(req.params.id);
        if (!report) return err(res, "Not found", 404);
        if (report.ngoId.toString() !== req.ngo._id.toString()) return err(res, "Not authorized", 403);

        const allowed = ["title","reportPeriod","periodStart","periodEnd","summary","metrics","highlights","challenges","nextSteps","villageId","status","isPublic"];
        allowed.forEach(k => {
            if (req.body[k] !== undefined) {
                if (["periodStart","periodEnd"].includes(k)) report[k] = req.body[k] ? new Date(req.body[k]) : report[k];
                else report[k] = req.body[k];
            }
        });
        await report.save();
        ok(res, { report }, "Updated");
    } catch (e) { err(res, e.message); }
};

export const deleteReport = async (req, res) => {
    try {
        const report = await ImpactReport.findById(req.params.id);
        if (!report) return err(res, "Not found", 404);
        if (report.ngoId.toString() !== req.ngo._id.toString() && req.user?.role !== "admin")
            return err(res, "Not authorized", 403);
        await report.deleteOne();
        ok(res, null, "Deleted");
    } catch (e) { err(res, e.message); }
};

// ── Admin ─────────────────────────────────────────────────────────────────

export const adminGetAll = async (req, res) => {
    try {
        const { status, ngoId, page = 1, limit = 25 } = req.query;
        const filter = {};
        if (status && status !== "all") filter.status = status;
        if (ngoId) filter.ngoId = ngoId;
        const skip = (Number(page) - 1) * Number(limit);
        const [reports, total] = await Promise.all([
            ImpactReport.find(filter).populate("ngoId", "ngoName").populate("villageId", "villageName district").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            ImpactReport.countDocuments(filter),
        ]);
        ok(res, { reports, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
    } catch (e) { err(res, e.message); }
};
