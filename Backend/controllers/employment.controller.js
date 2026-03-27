import Employment from "../models/Employment.model.js";

const ok  = (res, data, msg = "Success", code = 200) =>
    res.status(code).json({ success: true, message: msg, data });
const err = (res, msg, code = 500) =>
    res.status(code).json({ success: false, message: msg });

// ── Public ─────────────────────────────────────────────────────────────────

// GET /api/employment — public list of open opportunities
export const listPublic = async (req, res) => {
    try {
        const { category, status = "open", page = 1, limit = 20, search } = req.query;
        const filter = { isPublic: true };
        if (status !== "all") filter.status = status;
        if (category && category !== "all") filter.category = category;
        if (search) filter.title = { $regex: search, $options: "i" };

        const skip = (Number(page) - 1) * Number(limit);
        const [jobs, total] = await Promise.all([
            Employment.find(filter)
                .populate("ngoId", "ngoName logo")
                .populate("villageId", "villageName district state")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Employment.countDocuments(filter),
        ]);

        ok(res, { jobs, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
    } catch (e) {
        err(res, e.message);
    }
};

// GET /api/employment/:id — single public listing
export const getOne = async (req, res) => {
    try {
        const job = await Employment.findById(req.params.id)
            .populate("ngoId", "ngoName logo")
            .populate("villageId", "villageName district state")
            .lean();
        if (!job) return err(res, "Not found", 404);
        ok(res, { job });
    } catch (e) {
        err(res, e.message);
    }
};

// ── NGO ────────────────────────────────────────────────────────────────────

// GET /api/employment/my — NGO's own listings
export const getMyJobs = async (req, res) => {
    try {
        const jobs = await Employment.find({ ngoId: req.ngo._id })
            .populate("villageId", "villageName district state")
            .sort({ createdAt: -1 })
            .lean();
        ok(res, { jobs });
    } catch (e) {
        err(res, e.message);
    }
};

// POST /api/employment — create listing
export const createJob = async (req, res) => {
    try {
        const { title, category, description, skills, location, openings, stipend, status, startDate, endDate, villageId, isPublic } = req.body;
        if (!title?.trim()) return err(res, "Title is required", 400);

        const job = await Employment.create({
            ngoId: req.ngo._id,
            villageId: villageId || null,
            title: title.trim(),
            category: category || "skill_training",
            description: description?.trim() || "",
            skills: Array.isArray(skills) ? skills.map(s => s.trim()).filter(Boolean) : [],
            location: location?.trim() || "",
            openings: Number(openings) || 1,
            stipend: Number(stipend) || 0,
            status: status || "open",
            startDate: startDate ? new Date(startDate) : null,
            endDate: endDate ? new Date(endDate) : null,
            isPublic: isPublic !== false,
        });

        ok(res, { job }, "Employment listing created", 201);
    } catch (e) {
        err(res, e.message);
    }
};

// PUT /api/employment/:id — update listing
export const updateJob = async (req, res) => {
    try {
        const job = await Employment.findById(req.params.id);
        if (!job) return err(res, "Not found", 404);
        if (job.ngoId.toString() !== req.ngo._id.toString()) return err(res, "Not authorized", 403);

        const allowed = ["title","category","description","skills","location","openings","filled","stipend","status","startDate","endDate","villageId","isPublic"];
        allowed.forEach(k => {
            if (req.body[k] !== undefined) {
                if (k === "skills") job[k] = Array.isArray(req.body[k]) ? req.body[k].map(s => s.trim()).filter(Boolean) : [];
                else if (["openings","filled","stipend"].includes(k)) job[k] = Number(req.body[k]);
                else if (["startDate","endDate"].includes(k)) job[k] = req.body[k] ? new Date(req.body[k]) : null;
                else job[k] = req.body[k];
            }
        });

        await job.save();
        ok(res, { job }, "Updated");
    } catch (e) {
        err(res, e.message);
    }
};

// DELETE /api/employment/:id
export const deleteJob = async (req, res) => {
    try {
        const job = await Employment.findById(req.params.id);
        if (!job) return err(res, "Not found", 404);
        if (job.ngoId.toString() !== req.ngo._id.toString() && req.user?.role !== "admin") return err(res, "Not authorized", 403);
        await job.deleteOne();
        ok(res, null, "Deleted");
    } catch (e) {
        err(res, e.message);
    }
};

// ── Admin ──────────────────────────────────────────────────────────────────

// GET /api/employment/admin/all
export const adminGetAll = async (req, res) => {
    try {
        const { status, category, ngoId, page = 1, limit = 25 } = req.query;
        const filter = {};
        if (status && status !== "all") filter.status = status;
        if (category && category !== "all") filter.category = category;
        if (ngoId) filter.ngoId = ngoId;

        const skip = (Number(page) - 1) * Number(limit);
        const [jobs, total] = await Promise.all([
            Employment.find(filter)
                .populate("ngoId", "ngoName")
                .populate("villageId", "villageName district state")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            Employment.countDocuments(filter),
        ]);

        ok(res, { jobs, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
    } catch (e) {
        err(res, e.message);
    }
};
