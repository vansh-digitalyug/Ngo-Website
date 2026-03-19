import mongoose from "mongoose";
import FundLedger from "../models/FundLedger.model.js";
import VillageAdoption from "../models/VillageAdoption.model.js";

const ok  = (res, data, msg = "Success", code = 200) =>
    res.status(code).json({ success: true, message: msg, data });
const err = (res, msg, code = 500) =>
    res.status(code).json({ success: false, message: msg });

// ══════════════════════════════════════════════════════════════════════════════
// PUBLIC — transparency view
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/fund-ledger/public/:ngoId
export const getPublicLedger = async (req, res) => {
    try {
        const { ngoId } = req.params;
        const { page = 1, limit = 20, type, category } = req.query;

        const filter = { ngoId, isPublic: true };
        if (type && type !== "all") filter.type = type;
        if (category && category !== "all") filter.category = category;

        const skip = (Number(page) - 1) * Number(limit);

        const [entries, total, summary] = await Promise.all([
            FundLedger.find(filter)
                .populate("villageId", "villageName district state")
                .sort({ date: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            FundLedger.countDocuments(filter),
            FundLedger.aggregate([
                { $match: { ngoId: new mongoose.Types.ObjectId(ngoId), isPublic: true } },
                {
                    $group: {
                        _id: { type: "$type", category: "$category" },
                        total: { $sum: "$amount" },
                    },
                },
            ]),
        ]);

        // Build summary object
        const totals = { credit: 0, debit: 0 };
        const byCategory = {};
        summary.forEach(({ _id, total }) => {
            totals[_id.type] = (totals[_id.type] || 0) + total;
            if (!byCategory[_id.category]) byCategory[_id.category] = { credit: 0, debit: 0 };
            byCategory[_id.category][_id.type] = total;
        });

        ok(res, {
            entries,
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
            totals,
            byCategory,
        });
    } catch (e) {
        err(res, e.message);
    }
};

// GET /api/fund-ledger/public/summary — aggregated across all NGOs (platform-level)
export const getPlatformSummary = async (req, res) => {
    try {
        const summary = await FundLedger.aggregate([
            { $match: { isPublic: true } },
            {
                $group: {
                    _id: { type: "$type", category: "$category" },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        const totals = { credit: 0, debit: 0 };
        const byCategory = {};
        summary.forEach(({ _id, total, count }) => {
            totals[_id.type] = (totals[_id.type] || 0) + total;
            if (!byCategory[_id.category]) byCategory[_id.category] = { credit: 0, debit: 0, count: 0 };
            byCategory[_id.category][_id.type] = total;
            byCategory[_id.category].count += count;
        });

        ok(res, { totals, byCategory });
    } catch (e) {
        err(res, e.message);
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// NGO — manage own ledger
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/fund-ledger — NGO's full ledger
export const getMyLedger = async (req, res) => {
    try {
        const ngoId = req.ngo._id;
        const { page = 1, limit = 20, type, category, isPublic } = req.query;

        const filter = { ngoId };
        if (type && type !== "all") filter.type = type;
        if (category && category !== "all") filter.category = category;
        if (isPublic !== undefined) filter.isPublic = isPublic === "true";

        const skip = (Number(page) - 1) * Number(limit);
        const [entries, total] = await Promise.all([
            FundLedger.find(filter)
                .populate("villageId", "villageName")
                .populate("addedBy", "name")
                .sort({ date: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            FundLedger.countDocuments(filter),
        ]);

        // Running balance
        const allEntries = await FundLedger.find({ ngoId }).sort({ date: 1 }).select("type amount").lean();
        let balance = 0;
        allEntries.forEach(e => {
            if (e.type === "credit") balance += e.amount;
            else balance -= e.amount;
        });

        ok(res, {
            entries,
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
            balance,
        });
    } catch (e) {
        err(res, e.message);
    }
};

// GET /api/fund-ledger/summary — aggregated summary for NGO
export const getMySummary = async (req, res) => {
    try {
        const ngoId = req.ngo._id;
        const summary = await FundLedger.aggregate([
            { $match: { ngoId } },
            {
                $group: {
                    _id: { type: "$type", category: "$category" },
                    total: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
        ]);

        const totals = { credit: 0, debit: 0 };
        const byCategory = {};
        summary.forEach(({ _id, total, count }) => {
            totals[_id.type] = (totals[_id.type] || 0) + total;
            if (!byCategory[_id.category]) byCategory[_id.category] = { credit: 0, debit: 0, count: 0 };
            byCategory[_id.category][_id.type] = total;
            byCategory[_id.category].count += count;
        });

        const balance = totals.credit - totals.debit;
        ok(res, { totals, byCategory, balance });
    } catch (e) {
        err(res, e.message);
    }
};

// POST /api/fund-ledger — add entry (NGO)
export const addEntry = async (req, res) => {
    try {
        const ngoId = req.ngo._id;
        const { type, amount, category, description, referenceId, receiptKey, date, isPublic, villageId } = req.body;

        if (!["credit", "debit"].includes(type)) return err(res, "Type must be credit or debit", 400);
        if (!amount || Number(amount) < 1) return err(res, "Valid amount required", 400);
        if (!category) return err(res, "Category required", 400);
        if (!description?.trim()) return err(res, "Description required", 400);

        // Validate villageId belongs to this NGO
        if (villageId) {
            const village = await VillageAdoption.findOne({ _id: villageId, ngoId }).lean();
            if (!village) return err(res, "Village not found or not yours", 404);
        }

        const entry = await FundLedger.create({
            ngoId,
            type,
            amount: Number(amount),
            category,
            description: description.trim(),
            referenceId: referenceId?.trim() || "",
            receiptKey: receiptKey || null,
            date: date ? new Date(date) : new Date(),
            addedBy: req.user._id,
            isPublic: isPublic !== false,
            villageId: villageId || null,
        });

        ok(res, { entry }, "Entry added", 201);
    } catch (e) {
        err(res, e.message);
    }
};

// PUT /api/fund-ledger/:id — edit entry (NGO)
export const updateEntry = async (req, res) => {
    try {
        const entry = await FundLedger.findOne({ _id: req.params.id, ngoId: req.ngo._id });
        if (!entry) return err(res, "Entry not found", 404);

        const { description, referenceId, receiptKey, date, isPublic, category, amount, type } = req.body;
        if (description) entry.description = description.trim();
        if (referenceId !== undefined) entry.referenceId = referenceId;
        if (receiptKey !== undefined) entry.receiptKey = receiptKey;
        if (date) entry.date = new Date(date);
        if (isPublic !== undefined) entry.isPublic = Boolean(isPublic);
        if (category) entry.category = category;
        if (amount) entry.amount = Number(amount);
        if (type) entry.type = type;

        await entry.save();
        ok(res, { entry }, "Entry updated");
    } catch (e) {
        err(res, e.message);
    }
};

// DELETE /api/fund-ledger/:id — delete entry (NGO/admin)
export const deleteEntry = async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        // NGO can only delete their own
        if (req.ngo) filter.ngoId = req.ngo._id;

        const entry = await FundLedger.findOneAndDelete(filter);
        if (!entry) return err(res, "Entry not found", 404);
        ok(res, null, "Entry deleted");
    } catch (e) {
        err(res, e.message);
    }
};

// GET /api/fund-ledger/admin/all — admin: all entries across all NGOs
export const adminGetAll = async (req, res) => {
    try {
        const { ngoId, type, category, page = 1, limit = 30 } = req.query;
        const filter = {};
        if (ngoId) filter.ngoId = ngoId;
        if (type && type !== "all") filter.type = type;
        if (category && category !== "all") filter.category = category;

        const skip = (Number(page) - 1) * Number(limit);
        const [entries, total] = await Promise.all([
            FundLedger.find(filter)
                .populate("ngoId", "ngoName")
                .populate("addedBy", "name")
                .populate("villageId", "villageName")
                .sort({ date: -1 })
                .skip(skip)
                .limit(Number(limit))
                .lean(),
            FundLedger.countDocuments(filter),
        ]);

        ok(res, {
            entries,
            pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        });
    } catch (e) {
        err(res, e.message);
    }
};
