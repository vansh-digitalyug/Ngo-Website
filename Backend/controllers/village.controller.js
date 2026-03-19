import VillageAdoption from "../models/VillageAdoption.model.js";
import LocalProblem from "../models/LocalProblem.model.js";
import FundLedger from "../models/FundLedger.model.js";

// ─── helpers ──────────────────────────────────────────────────────────────────
const ok  = (res, data, msg = "Success", code = 200) =>
    res.status(code).json({ success: true, message: msg, data });
const err = (res, msg, code = 500) =>
    res.status(code).json({ success: false, message: msg });

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/villages — list all (public)
export const listVillages = async (req, res) => {
    try {
        const { state, status = "active", page = 1, limit = 12 } = req.query;
        const filter = {};
        if (state) filter.state = { $regex: state, $options: "i" };
        if (status !== "all") filter.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const [villages, total] = await Promise.all([
            VillageAdoption.find(filter)
                .populate("ngoId", "ngoName logo")
                .sort({ adoptedAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            VillageAdoption.countDocuments(filter),
        ]);

        ok(res, {
            villages,
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        });
    } catch (e) {
        err(res, e.message);
    }
};

// GET /api/villages/:id — single village (public)
export const getVillage = async (req, res) => {
    try {
        const village = await VillageAdoption.findById(req.params.id)
            .populate("ngoId", "ngoName logo email phone")
            .lean();
        if (!village) return err(res, "Village not found", 404);

        // Attach problem counts
        const problemCounts = await LocalProblem.aggregate([
            { $match: { villageId: village._id } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        village.problemStats = {
            pending:     0,
            in_progress: 0,
            solved:      0,
        };
        problemCounts.forEach(({ _id, count }) => {
            village.problemStats[_id] = count;
        });

        // Attach fund summary
        const fundSummary = await FundLedger.aggregate([
            { $match: { villageId: village._id, isPublic: true } },
            { $group: { _id: "$type", total: { $sum: "$amount" } } },
        ]);
        village.fundSummary = { credit: 0, debit: 0 };
        fundSummary.forEach(({ _id, total }) => { village.fundSummary[_id] = total; });

        ok(res, { village });
    } catch (e) {
        err(res, e.message);
    }
};

// GET /api/villages/:id/problems — problems in a village (public)
export const getVillageProblems = async (req, res) => {
    try {
        const { status, category, page = 1, limit = 20 } = req.query;
        const filter = { villageId: req.params.id };
        if (status && status !== "all") filter.status = status;
        if (category && category !== "all") filter.category = category;

        const skip = (Number(page) - 1) * Number(limit);
        const [problems, total] = await Promise.all([
            LocalProblem.find(filter)
                .populate("submittedBy", "name")
                .sort({ priority: -1, createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            LocalProblem.countDocuments(filter),
        ]);

        ok(res, {
            problems,
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        });
    } catch (e) {
        err(res, e.message);
    }
};

// POST /api/villages/:id/problems — submit a problem (optionalAuth)
export const submitProblem = async (req, res) => {
    try {
        const village = await VillageAdoption.findById(req.params.id).lean();
        if (!village) return err(res, "Village not found", 404);

        const { title, description, category, priority } = req.body;
        if (!title?.trim()) return err(res, "Problem title is required", 400);
        if (!category) return err(res, "Category is required", 400);

        const problem = await LocalProblem.create({
            villageId: req.params.id,
            ngoId: village.ngoId,
            submittedBy: req.user?._id || null,
            submittedByName: req.user?.name || "Anonymous",
            title: title.trim(),
            description: description?.trim() || "",
            category,
            priority: priority || "medium",
        });

        ok(res, { problem }, "Problem submitted successfully", 201);
    } catch (e) {
        err(res, e.message);
    }
};

// PUT /api/villages/problems/:problemId/upvote — upvote (auth)
export const upvoteProblem = async (req, res) => {
    try {
        const problem = await LocalProblem.findById(req.params.problemId);
        if (!problem) return err(res, "Problem not found", 404);

        const userId = req.user._id.toString();
        const alreadyVoted = problem.upvotes.some(id => id.toString() === userId);

        if (alreadyVoted) {
            problem.upvotes = problem.upvotes.filter(id => id.toString() !== userId);
        } else {
            problem.upvotes.push(req.user._id);
        }

        await problem.save();
        ok(res, { upvotes: problem.upvotes.length, voted: !alreadyVoted });
    } catch (e) {
        err(res, e.message);
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// NGO / ADMIN ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/villages/my — NGO's own villages
export const getMyVillages = async (req, res) => {
    try {
        const ngoId = req.ngo?._id || req.body.ngoId;
        const villages = await VillageAdoption.find({ ngoId })
            .sort({ adoptedAt: -1 })
            .lean();
        ok(res, { villages });
    } catch (e) {
        err(res, e.message);
    }
};

// POST /api/villages — create village adoption (NGO)
export const createVillage = async (req, res) => {
    try {
        const ngoId = req.ngo._id;
        const {
            villageName, district, state, pincode,
            totalFamilies, description, status,
            lat, lng,
        } = req.body;

        if (!villageName?.trim()) return err(res, "Village name is required", 400);
        if (!district?.trim() || !state?.trim()) return err(res, "District and state are required", 400);

        const data = {
            ngoId,
            villageName: villageName.trim(),
            district: district.trim(),
            state: state.trim(),
            pincode: pincode?.trim() || "",
            totalFamilies: Number(totalFamilies) || 0,
            description: description?.trim() || "",
            status: status || "active",
        };

        if (lat && lng) {
            data.location = { type: "Point", coordinates: [Number(lng), Number(lat)] };
        }

        const village = await VillageAdoption.create(data);
        ok(res, { village }, "Village adoption created", 201);
    } catch (e) {
        err(res, e.message);
    }
};

// PUT /api/villages/:id — update village (NGO/admin)
export const updateVillage = async (req, res) => {
    try {
        const village = await VillageAdoption.findById(req.params.id);
        if (!village) return err(res, "Village not found", 404);

        // NGO can only update their own
        if (req.ngo && village.ngoId.toString() !== req.ngo._id.toString()) {
            return err(res, "Not authorized to edit this village", 403);
        }

        const {
            villageName, district, state, pincode,
            totalFamilies, description, status,
            lat, lng, basicNeeds, coverImageKey,
        } = req.body;

        if (villageName) village.villageName = villageName.trim();
        if (district) village.district = district.trim();
        if (state) village.state = state.trim();
        if (pincode !== undefined) village.pincode = pincode;
        if (totalFamilies !== undefined) village.totalFamilies = Number(totalFamilies);
        if (description !== undefined) village.description = description.trim();
        if (status) village.status = status;
        if (coverImageKey) village.coverImageKey = coverImageKey;
        if (lat && lng) village.location = { type: "Point", coordinates: [Number(lng), Number(lat)] };
        if (basicNeeds) village.basicNeeds = { ...village.basicNeeds, ...basicNeeds };

        await village.save();
        ok(res, { village }, "Village updated");
    } catch (e) {
        err(res, e.message);
    }
};

// POST /api/villages/:id/milestone — add milestone (NGO)
export const addMilestone = async (req, res) => {
    try {
        const village = await VillageAdoption.findById(req.params.id);
        if (!village) return err(res, "Village not found", 404);
        if (req.ngo && village.ngoId.toString() !== req.ngo._id.toString()) {
            return err(res, "Not authorized", 403);
        }

        const { title, description, achievedAt, imageKey } = req.body;
        if (!title?.trim()) return err(res, "Milestone title required", 400);

        village.milestones.push({
            title: title.trim(),
            description: description?.trim() || "",
            achievedAt: achievedAt ? new Date(achievedAt) : new Date(),
            imageKey: imageKey || null,
        });

        await village.save();
        ok(res, { milestones: village.milestones }, "Milestone added");
    } catch (e) {
        err(res, e.message);
    }
};

// DELETE /api/villages/:id/milestone/:milestoneId — remove milestone
export const removeMilestone = async (req, res) => {
    try {
        const village = await VillageAdoption.findById(req.params.id);
        if (!village) return err(res, "Village not found", 404);
        village.milestones = village.milestones.filter(
            m => m._id.toString() !== req.params.milestoneId
        );
        await village.save();
        ok(res, { milestones: village.milestones }, "Milestone removed");
    } catch (e) {
        err(res, e.message);
    }
};

// PUT /api/villages/problems/:problemId/status — update problem status (NGO/admin)
export const updateProblemStatus = async (req, res) => {
    try {
        const problem = await LocalProblem.findById(req.params.problemId);
        if (!problem) return err(res, "Problem not found", 404);

        const { status, resolvedNote } = req.body;
        if (!["pending", "in_progress", "solved"].includes(status)) {
            return err(res, "Invalid status", 400);
        }

        problem.status = status;
        if (status === "solved") {
            problem.resolvedAt = new Date();
            problem.resolvedNote = resolvedNote?.trim() || "";
            problem.resolvedBy = req.user._id;
        }

        await problem.save();
        ok(res, { problem }, "Problem status updated");
    } catch (e) {
        err(res, e.message);
    }
};

// DELETE /api/villages/:id — delete village (admin only)
export const deleteVillage = async (req, res) => {
    try {
        const village = await VillageAdoption.findByIdAndDelete(req.params.id);
        if (!village) return err(res, "Village not found", 404);
        // Also clean up problems
        await LocalProblem.deleteMany({ villageId: req.params.id });
        ok(res, null, "Village deleted");
    } catch (e) {
        err(res, e.message);
    }
};

// GET /api/villages/admin/all — admin: all villages across all NGOs
export const adminListVillages = async (req, res) => {
    try {
        const { state, status, ngoId, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (state) filter.state = { $regex: state, $options: "i" };
        if (status && status !== "all") filter.status = status;
        if (ngoId) filter.ngoId = ngoId;

        const skip = (Number(page) - 1) * Number(limit);
        const [villages, total] = await Promise.all([
            VillageAdoption.find(filter)
                .populate("ngoId", "ngoName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            VillageAdoption.countDocuments(filter),
        ]);

        ok(res, {
            villages,
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        });
    } catch (e) {
        err(res, e.message);
    }
};
