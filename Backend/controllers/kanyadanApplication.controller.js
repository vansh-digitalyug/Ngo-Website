import KanyadanApplication from "../models/kanyadanApplication.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import "../config/loadEnv.js";

// ─── Public: Submit application ───────────────────────────────────────────────
export const submitKanyadanApplication = asyncHandler(async (req, res) => {
  const {
    guardianName, mobile, state, district, village,
    girlName, girlAge, annualIncome, howHeard, message
  } = req.body;

  // Basic validation
  if (!guardianName?.trim()) throw new ApiError(400, "Guardian name is required");
  if (!mobile?.trim()) throw new ApiError(400, "Mobile number is required");
  if (!/^[6-9]\d{9}$/.test(String(mobile).trim())) {
    throw new ApiError(400, "Enter a valid 10-digit Indian mobile number");
  }
  if (!state?.trim()) throw new ApiError(400, "State is required");
  if (!district?.trim()) throw new ApiError(400, "District is required");
  if (!girlName?.trim()) throw new ApiError(400, "Girl's name is required");

  const age = Number(girlAge);
  if (!girlAge || isNaN(age) || age < 1 || age > 12) {
    throw new ApiError(400, "Girl's age must be between 1 and 12 years");
  }

  const validIncomes = ["below1L", "1to1.5L", "1.5to2L", "2to2.5L"];
  if (!validIncomes.includes(annualIncome)) {
    throw new ApiError(400, "Please select a valid annual income range");
  }

  // Check for duplicate (same mobile + girlName to prevent re-submissions)
  const duplicate = await KanyadanApplication.findOne({
    mobile: String(mobile).trim(),
    girlName: { $regex: new RegExp(`^${String(girlName).trim()}$`, "i") }
  }).lean();

  if (duplicate) {
    throw new ApiError(409, "An application for this girl has already been submitted with this mobile number.");
  }

  // Optionally link to logged-in user (if Authorization header present)
  let linkedUserId = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.userId) linkedUserId = decoded.userId;
    } catch { /* invalid token — treat as guest */ }
  }

  const application = await KanyadanApplication.create({
    userId: linkedUserId,
    guardianName: String(guardianName).trim(),
    mobile: String(mobile).trim(),
    state: String(state).trim(),
    district: String(district).trim(),
    village: String(village || "").trim(),
    girlName: String(girlName).trim(),
    girlAge: age,
    annualIncome,
    howHeard: String(howHeard || "").trim(),
    message: String(message || "").trim()
  });

  return res.status(201).json(
    new ApiResponse(201, "Application submitted successfully. Our team will contact you within 2–3 working days.", {
      id: application._id
    })
  );
});

// ─── Admin: Get all applications with filters & pagination ────────────────────
export const getAllKanyadanApplications = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 15 } = req.query;

  const filter = {};

  if (status && ["Pending", "Under Review", "Approved", "Rejected"].includes(status)) {
    filter.status = status;
  }

  if (search) {
    const regex = { $regex: search, $options: "i" };
    filter.$or = [
      { guardianName: regex },
      { girlName: regex },
      { mobile: regex },
      { state: regex },
      { district: regex }
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [applications, total] = await Promise.all([
    KanyadanApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    KanyadanApplication.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Kanyadan applications fetched successfully", {
      applications,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    })
  );
});

// ─── Admin: Update application status ────────────────────────────────────────
export const updateKanyadanApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;

  const validStatuses = ["Pending", "Under Review", "Approved", "Rejected"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${validStatuses.join(", ")}`);
  }

  const application = await KanyadanApplication.findByIdAndUpdate(
    id,
    {
      $set: {
        status,
        ...(adminNote !== undefined && { adminNote: String(adminNote).trim() })
      }
    },
    { new: true }
  );

  if (!application) throw new ApiError(404, "Application not found");

  return res.status(200).json(
    new ApiResponse(200, `Application ${status.toLowerCase()} successfully`, application)
  );
});

// ─── Admin: Delete application ────────────────────────────────────────────────
export const deleteKanyadanApplication = asyncHandler(async (req, res) => {
  const application = await KanyadanApplication.findByIdAndDelete(req.params.id);
  if (!application) throw new ApiError(404, "Application not found");

  return res.status(200).json(
    new ApiResponse(200, "Application deleted successfully")
  );
});

// ─── Admin: Get summary stats ─────────────────────────────────────────────────
export const getKanyadanStats = asyncHandler(async (req, res) => {
  const [total, pending, underReview, approved, rejected] = await Promise.all([
    KanyadanApplication.countDocuments(),
    KanyadanApplication.countDocuments({ status: "Pending" }),
    KanyadanApplication.countDocuments({ status: "Under Review" }),
    KanyadanApplication.countDocuments({ status: "Approved" }),
    KanyadanApplication.countDocuments({ status: "Rejected" })
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Stats fetched", { total, pending, underReview, approved, rejected })
  );
});
