import Survey from "../models/Survey.model.js";
import SurveyResponse from "../models/SurveyResponse.model.js";
import mongoose from "mongoose";

const ok  = (res, data, msg = "Success", code = 200) =>
    res.status(code).json({ success: true, message: msg, data });
const err = (res, msg, code = 500) =>
    res.status(code).json({ success: false, message: msg });

// ── NGO ────────────────────────────────────────────────────────────────────

export const getMySurveys = async (req, res) => {
    try {
        const surveys = await Survey.find({ ngoId: req.ngo._id })
            .populate("villageId", "villageName district")
            .sort({ createdAt: -1 })
            .lean();
        ok(res, { surveys });
    } catch (e) { err(res, e.message); }
};

export const createSurvey = async (req, res) => {
    try {
        const { title, description, questions, status, targetAudience, startDate, endDate, villageId, isPublic } = req.body;
        if (!title?.trim()) return err(res, "Title is required", 400);
        const survey = await Survey.create({
            ngoId: req.ngo._id,
            villageId: villageId || null,
            title: title.trim(),
            description: description?.trim() || "",
            questions: questions || [],
            status: status || "active",
            targetAudience: targetAudience?.trim() || "",
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            isPublic: isPublic !== false,
        });
        ok(res, { survey }, "Survey created", 201);
    } catch (e) { err(res, e.message); }
};

export const updateSurvey = async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.id);
        if (!survey) return err(res, "Not found", 404);
        if (survey.ngoId.toString() !== req.ngo._id.toString()) return err(res, "Not authorized", 403);

        const allowed = ["title","description","questions","status","targetAudience","startDate","endDate","villageId","isPublic"];
        allowed.forEach(k => {
            if (req.body[k] !== undefined) {
                if (["startDate","endDate"].includes(k)) survey[k] = req.body[k] ? new Date(req.body[k]) : null;
                else survey[k] = req.body[k];
            }
        });
        await survey.save();
        ok(res, { survey }, "Updated");
    } catch (e) { err(res, e.message); }
};

export const deleteSurvey = async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.id);
        if (!survey) return err(res, "Not found", 404);
        if (survey.ngoId.toString() !== req.ngo._id.toString() && req.user?.role !== "admin")
            return err(res, "Not authorized", 403);
        await SurveyResponse.deleteMany({ surveyId: survey._id });
        await survey.deleteOne();
        ok(res, null, "Deleted");
    } catch (e) { err(res, e.message); }
};

// GET /api/surveys/:id/results — aggregated results
export const getSurveyResults = async (req, res) => {
    try {
        const survey = await Survey.findById(req.params.id).lean();
        if (!survey) return err(res, "Not found", 404);
        if (survey.ngoId.toString() !== req.ngo._id.toString()) return err(res, "Not authorized", 403);

        const responses = await SurveyResponse.find({ surveyId: survey._id }).lean();

        // Aggregate answers per question
        const results = survey.questions.map(q => {
            const qId = q._id.toString();
            const answers = responses
                .flatMap(r => r.answers)
                .filter(a => a.questionId?.toString() === qId)
                .map(a => a.answer)
                .filter(a => a !== null && a !== undefined && a !== "");

            let aggregated = null;

            if (q.type === "multiple_choice") {
                const counts = {};
                (q.options || []).forEach(o => { counts[o] = 0; });
                answers.forEach(a => { if (counts[a] !== undefined) counts[a]++; });
                aggregated = { type: "bar", data: Object.entries(counts).map(([label, count]) => ({ label, count })) };

            } else if (q.type === "yes_no") {
                const yes = answers.filter(a => a === "yes").length;
                const no  = answers.filter(a => a === "no").length;
                aggregated = { type: "pie", yes, no, total: yes + no };

            } else if (q.type === "rating") {
                const nums = answers.map(Number).filter(n => !isNaN(n) && n >= 1 && n <= 5);
                const avg = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : 0;
                const dist = [1,2,3,4,5].map(v => ({ value: v, count: nums.filter(n => n === v).length }));
                aggregated = { type: "rating", avg: Number(avg), dist, total: nums.length };

            } else if (q.type === "scale") {
                const nums = answers.map(Number).filter(n => !isNaN(n));
                const avg = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : 0;
                aggregated = { type: "scale", avg: Number(avg), total: nums.length, min: q.scaleMin, max: q.scaleMax };

            } else {
                aggregated = { type: "text", answers: answers.slice(0, 50) };
            }

            return { questionId: qId, question: q.question, questionType: q.type, count: answers.length, aggregated };
        });

        ok(res, { survey, results, totalResponses: responses.length });
    } catch (e) { err(res, e.message); }
};

// ── Public (share link) ────────────────────────────────────────────────────

export const getSurveyByToken = async (req, res) => {
    try {
        const survey = await Survey.findOne({ shareToken: req.params.token })
            .populate("ngoId", "ngoName")
            .populate("villageId", "villageName district state")
            .lean();
        if (!survey) return err(res, "Survey not found", 404);
        if (survey.status !== "active") return err(res, "This survey is not currently active", 400);
        ok(res, { survey });
    } catch (e) { err(res, e.message); }
};

export const submitResponse = async (req, res) => {
    try {
        const survey = await Survey.findOne({ shareToken: req.params.token });
        if (!survey) return err(res, "Survey not found", 404);
        if (survey.status !== "active") return err(res, "Survey is not active", 400);

        const { respondentName, respondentPhone, answers } = req.body;
        if (!answers || !Array.isArray(answers)) return err(res, "Answers are required", 400);

        // Validate required questions
        const missing = survey.questions
            .filter(q => q.required)
            .filter(q => !answers.find(a => a.questionId === q._id.toString() && a.answer !== "" && a.answer !== null));
        if (missing.length > 0)
            return err(res, `Please answer required questions: ${missing.map(q => q.question).join(", ")}`, 400);

        const response = await SurveyResponse.create({
            surveyId: survey._id,
            ngoId: survey.ngoId,
            villageId: survey.villageId,
            respondentName: respondentName?.trim() || "Anonymous",
            respondentPhone: respondentPhone?.trim() || "",
            answers: answers.map(a => ({ questionId: new mongoose.Types.ObjectId(a.questionId), answer: a.answer })),
            submittedBy: req.user?._id || null,
        });

        await Survey.findByIdAndUpdate(survey._id, { $inc: { responseCount: 1 } });
        ok(res, { response }, "Response submitted", 201);
    } catch (e) { err(res, e.message); }
};

// ── Public listing (all active + public surveys) ──────────────────────────

export const getPublicSurveys = async (req, res) => {
    try {
        const { page = 1, limit = 12, search = "" } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const filter = { isPublic: true, status: { $ne: "closed" } };
        if (search.trim()) {
            filter.$or = [
                { title:       { $regex: search.trim(), $options: "i" } },
                { description: { $regex: search.trim(), $options: "i" } },
            ];
        }

        const [surveys, total] = await Promise.all([
            Survey.find(filter)
                .populate("ngoId",    "ngoName city state")
                .populate("villageId","villageName district state")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Survey.countDocuments(filter),
        ]);

        ok(res, {
            surveys,
            pagination: {
                total,
                page:  Number(page),
                pages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (e) { err(res, e.message); }
};

// ── Admin ──────────────────────────────────────────────────────────────────

export const adminGetAll = async (req, res) => {
    try {
        const { status, page = 1, limit = 25 } = req.query;
        const filter = {};
        if (status && status !== "all") filter.status = status;
        const skip = (Number(page) - 1) * Number(limit);
        const [surveys, total] = await Promise.all([
            Survey.find(filter).populate("ngoId", "ngoName").populate("villageId", "villageName").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            Survey.countDocuments(filter),
        ]);
        ok(res, { surveys, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
    } catch (e) { err(res, e.message); }
};
