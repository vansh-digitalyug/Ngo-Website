import User from "../models/user.model.js";
import Ngo from "../models/ngo.model.js";
import Volunteer from "../models/volunteer.model.js";
import Contact from "../models/contact.model.js";
import FundRequest from "../models/fundRequest.model.js";
import Payment from "../models/payment.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ─── Dashboard Stats ───
export const getDashboardStats = asyncHandler(async (req, res) => {
        const [
            totalUsers,
            totalNgos,
            pendingNgos,
            verifiedNgos,
            totalVolunteers,
            pendingVolunteers,
            totalContacts,
            newContacts,
            recentUsers,
            recentNgos,
            recentVolunteers,
            recentContacts
        ] = await Promise.all([
            User.countDocuments({ role: { $ne: "admin" } }),
            Ngo.countDocuments(),
            Ngo.countDocuments({ isVerified: false }),
            Ngo.countDocuments({ isVerified: true }),
            Volunteer.countDocuments(),
            Volunteer.countDocuments({ status: "Pending" }),
            Contact.countDocuments(),
            Contact.countDocuments({ status: "New" }),
            User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 }).limit(5).select("name email role createdAt").lean(),
            Ngo.find().sort({ createdAt: -1 }).limit(5).select("ngoName email isVerified createdAt").lean(),
            Volunteer.find().sort({ createdAt: -1 }).limit(5).select("fullName email status createdAt").lean(),
            Contact.find().sort({ createdAt: -1 }).limit(5).select("name email subject status createdAt").lean()
        ]);

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    totalNgos,
                    pendingNgos,
                    verifiedNgos,
                    totalVolunteers,
                    pendingVolunteers,
                    totalContacts,
                    newContacts
                },
                recent: {
                    users: recentUsers,
                    ngos: recentNgos,
                    volunteers: recentVolunteers,
                    contacts: recentContacts
                }
            }
        });
});

// ─── NGO Management ───
export const getAllNgos = asyncHandler(async (req, res) => {
        const { status, search, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (status === "verified") filter.isVerified = true;
        else if (status === "pending") filter.isVerified = false;

        if (search) {
            filter.$or = [
                { ngoName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { regNumber: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [ngos, total] = await Promise.all([
            Ngo.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            Ngo.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: ngos,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
});

export const updateNgoStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { isVerified } = req.body;

        if (typeof isVerified !== "boolean") {
            return res.status(400).json({ success: false, message: "isVerified must be a boolean" });
        }

        const ngo = await Ngo.findById(id);
        if (!ngo) {
            return res.status(404).json({ success: false, message: "NGO not found" });
        }

        // Update NGO verification status
        ngo.isVerified = isVerified;

        // If approving, link the user to the NGO
        if (isVerified) {
            // First check if NGO already has an owner
            let ownerUser = null;
            
            if (ngo.ownerId) {
                // Owner was set during registration (user was logged in)
                ownerUser = await User.findById(ngo.ownerId);
            }
            
            // If no owner yet, try to find user by NGO email
            if (!ownerUser) {
                ownerUser = await User.findOne({ email: ngo.email.toLowerCase() });
            }

            // Link user to NGO if found
            if (ownerUser) {
                ownerUser.ngoId = ngo._id;
                ownerUser.ngoRole = "owner";
                await ownerUser.save();
                
                // Also update NGO's ownerId if not set
                if (!ngo.ownerId) {
                    ngo.ownerId = ownerUser._id;
                }
            }
        } else {
            // If rejecting/revoking, optionally unlink user
            if (ngo.ownerId) {
                await User.findByIdAndUpdate(ngo.ownerId, {
                    $set: { ngoId: null, ngoRole: null }
                });
            }
        }

        await ngo.save();

        return res.status(200).json({
            success: true,
            message: `NGO ${isVerified ? "approved" : "rejected"} successfully`,
            data: ngo
        });
});

export const deleteNgo = asyncHandler(async (req, res) => {
        const ngo = await Ngo.findByIdAndDelete(req.params.id);
        if (!ngo) {
            return res.status(404).json({ success: false, message: "NGO not found" });
        }
        return res.status(200).json({ success: true, message: "NGO deleted successfully" });
});

// ─── Volunteer Management ───
export const getAllVolunteers = asyncHandler(async (req, res) => {
        const { status, search, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (status && ["Pending", "Approved", "Rejected"].includes(status)) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [volunteers, total] = await Promise.all([
            Volunteer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            Volunteer.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: volunteers,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
});

export const updateVolunteerStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!["Pending", "Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ success: false, message: "Status must be Pending, Approved, or Rejected" });
        }

        const volunteer = await Volunteer.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true }
        );

        if (!volunteer) {
            return res.status(404).json({ success: false, message: "Volunteer not found" });
        }

        return res.status(200).json({
            success: true,
            message: `Volunteer ${status.toLowerCase()} successfully`,
            data: volunteer
        });
});

export const deleteVolunteer = asyncHandler(async (req, res) => {
        const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
        if (!volunteer) {
            return res.status(404).json({ success: false, message: "Volunteer not found" });
        }
        return res.status(200).json({ success: true, message: "Volunteer deleted successfully" });
});

// ─── Contact Management ───
export const getAllContacts = asyncHandler(async (req, res) => {
        const { status, search, page = 1, limit = 20 } = req.query;
        const filter = {};

        if (status && ["New", "In Progress", "Resolved", "Spam"].includes(status)) {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [contacts, total] = await Promise.all([
            Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
            Contact.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: contacts,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
});

export const updateContactStatus = asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        if (!["New", "In Progress", "Resolved", "Spam"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid contact status" });
        }

        const contact = await Contact.findByIdAndUpdate(
            id,
            { $set: { status } },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact not found" });
        }

        return res.status(200).json({
            success: true,
            message: `Contact marked as ${status}`,
            data: contact
        });
});

export const deleteContact = asyncHandler(async (req, res) => {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) {
            return res.status(404).json({ success: false, message: "Contact not found" });
        }
        return res.status(200).json({ success: true, message: "Contact deleted successfully" });
});

// ─── User Management ───
export const getAllUsers = asyncHandler(async (req, res) => {
        const { search, page = 1, limit = 20 } = req.query;
        const filter = { role: { $ne: "admin" } };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [users, total] = await Promise.all([
            User.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .select("name email role emailVerified aadhaarVerified authProvider createdAt")
                .lean(),
            User.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: users,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
});
// ─── Fund Request Management ───

// Admin: View all NGO fund requests with filters and pagination
export const getAllFundRequests = asyncHandler(async (req, res) => {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && ["Pending", "Approved", "Released", "Rejected"].includes(status)) {
        filter.status = status;
    }

    if (search) {
        filter.$or = [
            { ngoName: { $regex: search, $options: "i" } },
            { purpose: { $regex: search, $options: "i" } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
        FundRequest.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("ngoId", "ngoName email city state")
            .lean(),
        FundRequest.countDocuments(filter)
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Fund requests fetched successfully", {
            requests,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        })
    );
});

// Admin: Approve, Reject, or Release funds for a specific request
export const updateFundRequestStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const VALID_STATUSES = ["Approved", "Released", "Rejected"];
    if (!status || !VALID_STATUSES.includes(status)) {
        throw new ApiError(400, `Status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const fundRequest = await FundRequest.findById(id);
    if (!fundRequest) {
        throw new ApiError(404, "Fund request not found");
    }

    // Guard invalid transitions
    if (fundRequest.status === "Rejected") {
        throw new ApiError(400, "Cannot update a rejected fund request");
    }
    if (fundRequest.status === "Released") {
        throw new ApiError(400, "Funds have already been released for this request");
    }
    if (status === "Released" && fundRequest.status !== "Approved") {
        throw new ApiError(400, "Funds can only be released after the request is approved");
    }

    fundRequest.status = status;
    fundRequest.adminNote = adminNote?.trim() || fundRequest.adminNote;

    if (status === "Released") {
        fundRequest.releasedAt = new Date();
    }

    await fundRequest.save();

    const messages = {
        Approved: "Fund request approved successfully",
        Released: "Funds released successfully. The NGO can now resolve the ticket.",
        Rejected: "Fund request rejected"
    };

    return res.status(200).json(
        new ApiResponse(200, messages[status], fundRequest)
    );
});

// ─── Donation Management ───

// Admin: All donations with filters, pagination, and per-NGO breakdown
export const getAllDonations = asyncHandler(async (req, res) => {
    const { ngoId, status = "paid", search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && ["created", "paid", "failed"].includes(status)) filter.status = status;
    if (ngoId) filter.ngoId = ngoId;
    if (search) {
        filter.$or = [
            { donorName: { $regex: search, $options: "i" } },
            { serviceTitle: { $regex: search, $options: "i" } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [donations, total, summary] = await Promise.all([
        Payment.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate("ngoId", "ngoName city state")
            .populate("user", "name email")
            .lean(),
        Payment.countDocuments(filter),
        Payment.aggregate([
            { $match: { status: "paid" } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" }, totalCount: { $sum: 1 } } }
        ])
    ]);

    const { totalAmount = 0, totalCount = 0 } = summary[0] || {};

    // Mask anonymous donor names
    const sanitized = donations.map(d => ({
        ...d,
        donorName: d.isAnonymous ? "Anonymous" : (d.donorName || "Anonymous")
    }));

    return res.status(200).json(
        new ApiResponse(200, "Donations fetched successfully", {
            donations: sanitized,
            summary: { totalAmount, totalCount },
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        })
    );
});

// Admin: Per-NGO donation totals (leaderboard)
export const getDonationsByNgo = asyncHandler(async (req, res) => {
    const breakdown = await Payment.aggregate([
        { $match: { status: "paid", ngoId: { $ne: null } } },
        {
            $group: {
                _id: "$ngoId",
                totalAmount: { $sum: "$amount" },
                totalCount: { $sum: 1 },
                lastDonationAt: { $max: "$createdAt" }
            }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 50 },
        {
            $lookup: {
                from: "ngos",
                localField: "_id",
                foreignField: "_id",
                as: "ngo"
            }
        },
        { $unwind: { path: "$ngo", preserveNullAndEmpty: true } },
        {
            $project: {
                ngoId: "$_id",
                ngoName: "$ngo.ngoName",
                city: "$ngo.city",
                state: "$ngo.state",
                totalAmount: 1,
                totalCount: 1,
                lastDonationAt: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Donation breakdown by NGO", breakdown)
    );
});
