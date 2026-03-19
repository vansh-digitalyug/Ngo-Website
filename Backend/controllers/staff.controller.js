import StaffMember from "../models/StaffMember.model.js";

const ok  = (res, data, msg = "Success", code = 200) =>
    res.status(code).json({ success: true, message: msg, data });
const err = (res, msg, code = 500) =>
    res.status(code).json({ success: false, message: msg });

// ── NGO ────────────────────────────────────────────────────────────────────

// GET /api/staff/my
export const getMyStaff = async (req, res) => {
    try {
        const { isActive } = req.query;
        const filter = { ngoId: req.ngo._id };
        if (isActive !== undefined) filter.isActive = isActive === "true";

        const staff = await StaffMember.find(filter)
            .populate("villageId", "villageName district state")
            .sort({ role: 1, name: 1 })
            .lean();
        ok(res, { staff });
    } catch (e) {
        err(res, e.message);
    }
};

// POST /api/staff
export const addStaff = async (req, res) => {
    try {
        const { name, role, specialization, phone, email, bio, employmentType, villageId, joinedAt, isActive } = req.body;
        if (!name?.trim()) return err(res, "Name is required", 400);
        if (!role) return err(res, "Role is required", 400);

        const member = await StaffMember.create({
            ngoId: req.ngo._id,
            villageId: villageId || null,
            name: name.trim(),
            role,
            specialization: specialization?.trim() || "",
            phone: phone?.trim() || "",
            email: email?.trim()?.toLowerCase() || "",
            bio: bio?.trim() || "",
            employmentType: employmentType || "volunteer",
            isActive: isActive !== false,
            joinedAt: joinedAt ? new Date(joinedAt) : new Date(),
        });

        ok(res, { member }, "Staff member added", 201);
    } catch (e) {
        err(res, e.message);
    }
};

// PUT /api/staff/:id
export const updateStaff = async (req, res) => {
    try {
        const member = await StaffMember.findById(req.params.id);
        if (!member) return err(res, "Not found", 404);
        if (member.ngoId.toString() !== req.ngo._id.toString()) return err(res, "Not authorized", 403);

        const allowed = ["name","role","specialization","phone","email","bio","employmentType","villageId","isActive","joinedAt"];
        allowed.forEach(k => {
            if (req.body[k] !== undefined) {
                if (k === "joinedAt") member[k] = req.body[k] ? new Date(req.body[k]) : member[k];
                else member[k] = req.body[k];
            }
        });

        await member.save();
        ok(res, { member }, "Updated");
    } catch (e) {
        err(res, e.message);
    }
};

// DELETE /api/staff/:id
export const deleteStaff = async (req, res) => {
    try {
        const member = await StaffMember.findById(req.params.id);
        if (!member) return err(res, "Not found", 404);
        if (member.ngoId.toString() !== req.ngo._id.toString() && req.user?.role !== "admin") return err(res, "Not authorized", 403);
        await member.deleteOne();
        ok(res, null, "Deleted");
    } catch (e) {
        err(res, e.message);
    }
};

// ── Admin ──────────────────────────────────────────────────────────────────

// GET /api/staff/admin/all
export const adminGetAll = async (req, res) => {
    try {
        const { role, ngoId, isActive, page = 1, limit = 30 } = req.query;
        const filter = {};
        if (role && role !== "all") filter.role = role;
        if (ngoId) filter.ngoId = ngoId;
        if (isActive !== undefined) filter.isActive = isActive === "true";

        const skip = (Number(page) - 1) * Number(limit);
        const [staff, total] = await Promise.all([
            StaffMember.find(filter)
                .populate("ngoId", "ngoName")
                .populate("villageId", "villageName district state")
                .sort({ role: 1, name: 1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            StaffMember.countDocuments(filter),
        ]);

        ok(res, { staff, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
    } catch (e) {
        err(res, e.message);
    }
};

// GET /api/staff/admin/stats
export const adminStats = async (req, res) => {
    try {
        const byRole = await StaffMember.aggregate([
            { $group: { _id: "$role", total: { $sum: 1 }, active: { $sum: { $cond: ["$isActive", 1, 0] } } } },
            { $sort: { total: -1 } },
        ]);
        const total = await StaffMember.countDocuments();
        ok(res, { byRole, total });
    } catch (e) {
        err(res, e.message);
    }
};
