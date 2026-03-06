import Ngo from "../models/ngo.model.js";
import Gallery from "../models/gallery.model.js";
import Volunteer from "../models/volunteer.model.js";
import Payment from "../models/payment.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ═══════════════════════════════════════════════════════════════════════════
// NGO DASHBOARD CONTROLLER
// All endpoints require authenticated NGO owner/manager
// ═══════════════════════════════════════════════════════════════════════════

export const getDashboardStats = asyncHandler(async (req, res) => {
  const ngoId = req.ngo._id;

  const [
    galleryTotal,
    galleryPending,
    galleryApproved,
    volunteersTotal,
    volunteersPending,
    recentGallery,
    recentVolunteers,
    donationAgg
  ] = await Promise.all([
    Gallery.countDocuments({ ngoId }),
    Gallery.countDocuments({ ngoId, approvalStatus: "pending" }),
    Gallery.countDocuments({ ngoId, approvalStatus: "approved" }),
    Volunteer.countDocuments({ ngoId }),
    Volunteer.countDocuments({ ngoId, status: "Pending" }),
    Gallery.find({ ngoId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title type category approvalStatus createdAt url"),
    Volunteer.find({ ngoId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName email status skills createdAt"),
    Payment.aggregate([
      { $match: { ngoId, status: "paid" } },
      { $group: { _id: null, total: { $sum: 1 }, amount: { $sum: "$amount" } } }
    ])
  ]);

  const donationStats = donationAgg[0] || { total: 0, amount: 0 };

  return res.status(200).json({
    success: true,
    data: {
      ngo: {
        _id: req.ngo._id,
        ngoName: req.ngo.ngoName,
        email: req.ngo.email,
        isVerified: req.ngo.isVerified,
        createdAt: req.ngo.createdAt,
        regNumber: req.ngo.regNumber,
        phone: req.ngo.phone,
        state: req.ngo.state,
        address: req.ngo.address,
        website: req.ngo.website,
        description: req.ngo.description,
        socialMedia: req.ngo.socialMedia,
        documents: req.ngo.documents
      },
      stats: {
        gallery: { total: galleryTotal, pending: galleryPending, approved: galleryApproved },
        volunteers: { total: volunteersTotal, pending: volunteersPending },
        donations: { total: donationStats.total, amount: donationStats.amount }
      },
      recent: { gallery: recentGallery, volunteers: recentVolunteers }
    }
  });
});

export const getNgoProfile = asyncHandler(async (req, res) => {
  const ngo = await Ngo.findById(req.ngo._id)
    .populate("ownerId", "name email")
    .populate("teamMembers.userId", "name email");

  if (!ngo) {
    throw new ApiError(404, "NGO not found");
  }

  return res.status(200).json({
    success: true,
    data: ngo
  });
});

export const updateNgoDocuments = asyncHandler(async (req, res) => {
  const { registrationCertificate, certificate12A, certificate80G } = req.body;

  const documentFields = { registrationCertificate, certificate12A, certificate80G };
  const updates = {};

  for (const [field, value] of Object.entries(documentFields)) {
    if (value !== undefined && String(value).trim() !== "") {
      updates[`documents.${field}`] = String(value).trim();
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "At least one document S3 key must be provided");
  }

  const ngo = await Ngo.findByIdAndUpdate(
    req.ngo._id,
    { $set: updates },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    message: "Documents updated successfully",
    data: ngo.documents
  });
});

export const updateNgoProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "description", "address", "phone", "whatsapp",
    "website", "socialMedia", "contactName", "contactRole"
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const ngo = await Ngo.findByIdAndUpdate(
    req.ngo._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: ngo
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GALLERY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export const getNgoGallery = asyncHandler(async (req, res) => {
  const { type, status, page = 1, limit = 20 } = req.query;
  const ngoId = req.ngo._id;

  const filter = { ngoId };
  if (type && ["image", "video"].includes(type)) filter.type = type;
  if (status && ["pending", "approved", "rejected"].includes(status)) filter.approvalStatus = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [items, total] = await Promise.all([
    Gallery.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Gallery.countDocuments(filter)
  ]);

  return res.status(200).json({
    success: true,
    data: items,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

export const uploadToGallery = asyncHandler(async (req, res) => {
  const { title, description, category, type } = req.body;
  const ngoId = req.ngo._id;

  let url = req.body.url || "";
  if (req.file) url = req.file.filename;

  if (!url) {
    throw new ApiError(400, "Image/Video URL is required");
  }

  const galleryItem = await Gallery.create({
    type: type || "image",
    title,
    description: description || "",
    url,
    category: category || "Other",
    ngoId,
    uploadedBy: req.user._id,
    approvalStatus: "pending",
    isActive: false
  });

  await Ngo.findByIdAndUpdate(ngoId, { $inc: { "stats.totalGalleryItems": 1 } });

  return res.status(201).json({
    success: true,
    message: "Uploaded successfully. Pending admin approval.",
    data: galleryItem
  });
});

export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ngoId = req.ngo._id;

  const item = await Gallery.findOne({ _id: id, ngoId });
  if (!item) {
    throw new ApiError(404, "Gallery item not found");
  }

  await Gallery.findByIdAndDelete(id);
  await Ngo.findByIdAndUpdate(ngoId, { $inc: { "stats.totalGalleryItems": -1 } });

  return res.status(200).json({
    success: true,
    message: "Deleted successfully"
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// VOLUNTEER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export const getNgoVolunteers = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const ngoId = req.ngo._id;

  const filter = { ngoId };
  if (status && ["Pending", "Approved", "Rejected"].includes(status)) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [volunteers, total] = await Promise.all([
    Volunteer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("user", "name email avatar"),
    Volunteer.countDocuments(filter)
  ]);

  return res.status(200).json({
    success: true,
    data: volunteers,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

export const updateVolunteerStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ngoId = req.ngo._id;

  if (!["Approved", "Rejected"].includes(status)) {
    throw new ApiError(400, "Invalid status. Must be 'Approved' or 'Rejected'");
  }

  const volunteer = await Volunteer.findOne({ _id: id, ngoId });
  if (!volunteer) {
    throw new ApiError(404, "Volunteer not found");
  }

  volunteer.status = status;
  await volunteer.save();

  if (status === "Approved") {
    await Ngo.findByIdAndUpdate(ngoId, { $inc: { "stats.totalVolunteers": 1 } });
  }

  return res.status(200).json({
    success: true,
    message: `Volunteer ${status.toLowerCase()} successfully`,
    data: volunteer
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// NGO STATUS CHECK (for pending page)
// ═══════════════════════════════════════════════════════════════════════════

export const getNgoStatus = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.ngoId && req.ngo) {
    return res.status(200).json({
      success: true,
      status: req.ngo.isVerified ? "approved" : "pending",
      data: {
        _id: req.ngo._id,
        ngoName: req.ngo.ngoName,
        email: req.ngo.email,
        isVerified: req.ngo.isVerified,
        createdAt: req.ngo.createdAt,
        regNumber: req.ngo.regNumber,
        phone: req.ngo.phone,
        state: req.ngo.state,
        address: req.ngo.address,
        website: req.ngo.website,
        description: req.ngo.description,
        socialMedia: req.ngo.socialMedia,
        documents: req.ngo.documents
      }
    });
  }

  const pendingNgo = await Ngo.findOne({ email: user.email.toLowerCase() });

  if (pendingNgo) {
    return res.status(200).json({
      success: true,
      status: pendingNgo.isVerified ? "approved" : "pending",
      data: {
        _id: pendingNgo._id,
        ngoName: pendingNgo.ngoName,
        email: pendingNgo.email,
        isVerified: pendingNgo.isVerified,
        createdAt: pendingNgo.createdAt,
        regNumber: pendingNgo.regNumber,
        phone: pendingNgo.phone,
        state: pendingNgo.state,
        address: pendingNgo.address,
        website: pendingNgo.website,
        description: pendingNgo.description,
        socialMedia: pendingNgo.socialMedia,
        documents: pendingNgo.documents
      }
    });
  }

  return res.status(200).json({
    success: true,
    status: "none",
    data: null
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DONATION HISTORY
// ═══════════════════════════════════════════════════════════════════════════

export const getNgoDonationHistory = asyncHandler(async (req, res) => {
  const ngoId = req.ngo._id;
  const { page = 1, limit = 20 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const [donations, total, summary] = await Promise.all([
    Payment.find({ ngoId, status: "paid" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("donorName isAnonymous amount serviceTitle createdAt razorpayPaymentId")
      .lean(),
    Payment.countDocuments({ ngoId, status: "paid" }),
    Payment.aggregate([
      { $match: { ngoId, status: "paid" } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" }, totalCount: { $sum: 1 } } }
    ])
  ]);

  const { totalAmount = 0, totalCount = 0 } = summary[0] || {};

  // Mask donor names for anonymous donations
  const sanitized = donations.map(d => ({
    ...d,
    donorName: d.isAnonymous ? "Anonymous" : (d.donorName || "Anonymous")
  }));

  return res.status(200).json(
    new ApiResponse(200, "Donation history fetched", {
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

export default {
  getDashboardStats,
  getNgoProfile,
  updateNgoProfile,
  updateNgoDocuments,
  getNgoGallery,
  uploadToGallery,
  deleteGalleryItem,
  getNgoVolunteers,
  updateVolunteerStatus,
  getNgoStatus,
  getNgoDonationHistory
};
