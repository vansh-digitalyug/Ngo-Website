import Employment from "../models/Employment.model.js";
import EmploymentApplication from "../models/EmploymentApplication.model.js";

const ok  = (res, data, msg = "Success", code = 200) =>
    res.status(code).json({ success: true, message: msg, data });
const err = (res, msg, code = 500) =>
    res.status(code).json({ success: false, message: msg });

// ── Public ──────────────────────────────────────────────────────────────────

// POST /api/employment-applications — submit application
export const applyForJob = async (req, res) => {
    try {
        const { employmentId, name, email, phone, age, education, experience, message } = req.body;

        if (!employmentId) return err(res, "Employment ID is required", 400);
        if (!name?.trim())  return err(res, "Name is required", 400);
        if (!email?.trim()) return err(res, "Email is required", 400);
        if (!phone?.trim()) return err(res, "Phone is required", 400);

        const job = await Employment.findById(employmentId).lean();
        if (!job)            return err(res, "Job listing not found", 404);
        if (job.status !== "open") return err(res, "This position is no longer accepting applications", 400);

        // prevent duplicate
        const exists = await EmploymentApplication.findOne({ employmentId, email: email.toLowerCase().trim() });
        if (exists) return err(res, "You have already applied for this position", 400);

        const application = await EmploymentApplication.create({
            employmentId,
            ngoId: job.ngoId,
            userId: req.user?._id || null,
            name:       name.trim(),
            email:      email.trim().toLowerCase(),
            phone:      phone.trim(),
            age:        age ? Number(age) : null,
            education:  education || "other",
            experience: experience?.trim() || "",
            message:    message?.trim() || "",
        });

        ok(res, { application }, "Application submitted successfully", 201);
    } catch (e) {
        if (e.code === 11000) return err(res, "You have already applied for this position", 400);
        err(res, e.message);
    }
};

// ── NGO ─────────────────────────────────────────────────────────────────────

// GET /api/employment-applications/ngo — all applications for this NGO
export const getNgoApplications = async (req, res) => {
    try {
        const { status, jobId, page = 1, limit = 20 } = req.query;
        const filter = { ngoId: req.ngo._id };
        if (status && status !== "all") filter.status = status;
        if (jobId) filter.employmentId = jobId;

        const skip = (Number(page) - 1) * Number(limit);
        const [applications, total] = await Promise.all([
            EmploymentApplication.find(filter)
                .populate("employmentId", "title category location stipend")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            EmploymentApplication.countDocuments(filter),
        ]);

        ok(res, { applications, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
    } catch (e) {
        err(res, e.message);
    }
};

// PUT /api/employment-applications/:id/status — update application status
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status, ngoNote } = req.body;
        const allowed = ["pending", "reviewing", "accepted", "rejected"];
        if (!allowed.includes(status)) return err(res, "Invalid status", 400);

        const application = await EmploymentApplication.findById(req.params.id);
        if (!application) return err(res, "Application not found", 404);
        if (application.ngoId.toString() !== req.ngo._id.toString())
            return err(res, "Not authorized", 403);

        application.status  = status;
        if (ngoNote !== undefined) application.ngoNote = ngoNote?.trim() || "";
        await application.save();

        ok(res, { application }, "Status updated");
    } catch (e) {
        err(res, e.message);
    }
};
