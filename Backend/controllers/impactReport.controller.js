import mongoose      from "mongoose";
import ImpactReport  from "../models/ImpactReport.model.js";
import Volunteer     from "../models/volunteer.model.js";
import StaffMember   from "../models/StaffMember.model.js";
import EventModel    from "../models/event.model.js";
import VillageAdoption from "../models/VillageAdoption.model.js";
import FundLedger    from "../models/FundLedger.model.js";
import Employment    from "../models/Employment.model.js";
import SurveyModel   from "../models/Survey.model.js";
import SurveyResponse from "../models/SurveyResponse.model.js";
import LocalProblem  from "../models/LocalProblem.model.js";
import Ngo           from "../models/ngo.model.js";

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

// ── Shared helper: pull live data from DB across ALL NGOs for a given period ─

async function gatherLiveData(start, end, reportPeriod) {
    const cRange = { $gte: start, $lte: end };
    const dRange = { $gte: start, $lte: end };

    const [
        newVolunteers, approvedVolunteers,
        newStaff, activeStaff,
        eventsCompleted, eventsTotal,
        newVillages, totalVillages,
        fundsIn, fundsOut, eduSpend, healthSpend,
        jobsFilled, skillTrainings,
        activeSurveys, surveyResponses,
        problemsSolved,
    ] = await Promise.all([
        Volunteer.countDocuments({ createdAt: cRange }),
        Volunteer.countDocuments({ status: "Approved" }),
        StaffMember.countDocuments({ createdAt: cRange }),
        StaffMember.countDocuments({ isActive: true }),
        EventModel.countDocuments({ status: "completed", date: dRange }),
        EventModel.countDocuments({}),
        VillageAdoption.countDocuments({ adoptedAt: dRange }),
        VillageAdoption.countDocuments({ status: "active" }),
        FundLedger.aggregate([{ $match: { type: "credit",        date: dRange } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        FundLedger.aggregate([{ $match: { type: "debit",         date: dRange } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        FundLedger.aggregate([{ $match: { category: "education", date: dRange } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        FundLedger.aggregate([{ $match: { category: "medical",   date: dRange } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
        Employment.aggregate([{ $match: { createdAt: cRange } }, { $group: { _id: null, total: { $sum: "$filled" } } }]),
        Employment.countDocuments({ category: "skill_training", createdAt: cRange }),
        SurveyModel.countDocuments({ status: "active", createdAt: cRange }),
        SurveyResponse.countDocuments({ createdAt: cRange }),
        LocalProblem.countDocuments({ status: "solved", resolvedAt: dRange }),
    ]);

    const totalIn    = fundsIn[0]?.total     || 0;
    const totalOut   = fundsOut[0]?.total    || 0;
    const eduAmount  = eduSpend[0]?.total    || 0;
    const healthAmt  = healthSpend[0]?.total || 0;
    const filledJobs = jobsFilled[0]?.total  || 0;

    const metrics = [];
    const push = (label, value, unit, category) => {
        if (value > 0) metrics.push({ label, value, unit, category, change: 0, changeType: "neutral" });
    };
    push("New Volunteers Registered",  newVolunteers,      "people",    "beneficiaries");
    push("Active Volunteers",          approvedVolunteers, "people",    "beneficiaries");
    push("Survey Responses Collected", surveyResponses,    "responses", "beneficiaries");
    push("Community Surveys Launched", activeSurveys,      "surveys",   "beneficiaries");
    push("Health Investment",          healthAmt,          "₹",         "health");
    push("Education Investment",       eduAmount,          "₹",         "education");
    push("Jobs Placed",                filledJobs,         "people",    "employment");
    push("Skill Training Programs",    skillTrainings,     "programs",  "employment");
    push("Villages Under Adoption",    totalVillages,      "villages",  "infrastructure");
    push("New Villages Adopted",       newVillages,        "villages",  "infrastructure");
    push("Local Problems Resolved",    problemsSolved,     "problems",  "infrastructure");
    push("Events Completed",           eventsCompleted,    "events",    "other");
    push("Total Events Organised",     eventsTotal,        "events",    "other");
    push("Active Staff Members",       activeStaff,        "people",    "other");
    push("New Staff Added",            newStaff,           "people",    "other");
    push("Funds Received",             totalIn,            "₹",         "other");
    push("Funds Utilised",             totalOut,           "₹",         "other");

    const highlights = [];
    if (newVolunteers > 0)   highlights.push(`${newVolunteers} new volunteer${newVolunteers > 1 ? "s" : ""} joined this period`);
    if (eventsCompleted > 0) highlights.push(`Successfully completed ${eventsCompleted} community event${eventsCompleted > 1 ? "s" : ""}`);
    if (filledJobs > 0)      highlights.push(`${filledJobs} individual${filledJobs > 1 ? "s" : ""} placed in employment`);
    if (newVillages > 0)     highlights.push(`${newVillages} new village${newVillages > 1 ? "s" : ""} adopted for development`);
    if (problemsSolved > 0)  highlights.push(`Resolved ${problemsSolved} local community problem${problemsSolved > 1 ? "s" : ""}`);
    if (totalIn > 0)         highlights.push(`Raised ₹${totalIn.toLocaleString("en-IN")} in total funds`);
    if (activeSurveys > 0)   highlights.push(`Launched ${activeSurveys} community survey${activeSurveys > 1 ? "s" : ""}`);

    const pMap   = { monthly: "month", quarterly: "quarter", annual: "year", custom: "period" };
    const summary = [
        `During this ${pMap[reportPeriod] || "period"}, our platform continued its mission of community development across all registered NGOs.`,
        totalVillages      > 0 ? `Actively working across ${totalVillages} village${totalVillages > 1 ? "s" : ""}.` : "",
        approvedVolunteers > 0 ? `A combined team of ${approvedVolunteers} approved volunteers supported operations.` : "",
        eventsCompleted    > 0 ? `${eventsCompleted} event${eventsCompleted > 1 ? "s were" : " was"} successfully conducted.` : "",
        totalIn            > 0 ? `₹${totalIn.toLocaleString("en-IN")} received and ₹${totalOut.toLocaleString("en-IN")} utilised across programs.` : "",
        "This report was auto-generated from verified data recorded across all NGOs in the system.",
    ].filter(Boolean).join(" ");

    return { metrics, highlights, summary };
}

// ── Auto-Generate (Admin only) ────────────────────────────────────────────

export const autoGenerateReport = async (req, res) => {
    try {
        const { periodStart, periodEnd, reportPeriod = "monthly" } = req.body;
        if (!periodStart || !periodEnd) return err(res, "periodStart and periodEnd are required", 400);

        const start = new Date(periodStart);
        const end   = new Date(periodEnd);

        const { metrics, highlights, summary } = await gatherLiveData(start, end, reportPeriod);

        const months  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const s       = new Date(periodStart);
        const tPeriod =
            reportPeriod === "monthly"   ? `${months[s.getMonth()]} ${s.getFullYear()}` :
            reportPeriod === "quarterly" ? `Q${Math.ceil((s.getMonth() + 1) / 3)} ${s.getFullYear()}` :
            reportPeriod === "annual"    ? `${s.getFullYear()}` :
            `${s.toLocaleDateString("en-IN",{day:"numeric",month:"short"})} – ${new Date(periodEnd).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}`;
        const title = `Overall Platform Impact Report — ${tPeriod}`;

        const report = await ImpactReport.create({
            ngoId: null, title, reportPeriod,
            periodStart: start, periodEnd: end,
            summary, metrics, highlights,
            challenges: [], nextSteps: [],
            status: "published", isPublic: true,
        });
        ok(res, { report }, "Report auto-generated successfully", 201);
    } catch (e) { err(res, e.message); }
};

// ── Auto-Update (Admin only) ──────────────────────────────────────────────

export const autoUpdateReport = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return err(res, "Invalid report ID", 400);

        const report = await ImpactReport.findById(id);
        if (!report) return err(res, "Report not found", 404);

        const { metrics, highlights, summary } = await gatherLiveData(
            report.periodStart, report.periodEnd, report.reportPeriod
        );

        report.metrics    = metrics;
        report.highlights = highlights;
        report.summary    = summary;
        await report.save();
        await report.populate("ngoId", "ngoName");

        ok(res, { report }, "Report data updated from live database");
    } catch (e) { err(res, e.message); }
};
