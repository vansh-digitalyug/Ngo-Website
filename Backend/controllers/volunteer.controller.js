import Volunteer from "../models/volunteer.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendVolunteerApplicationEmail } from "../services/mail.service.js";
import { createActivity } from "./activity.controller.js";

// Get volunteer application status for the logged-in user
export const getVolunteerStatus = asyncHandler(async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const volunteer = await Volunteer.findOne({ user: req.userId })
    .select("status")
    .lean();

  return res.status(200).json({
    success: true,
    hasApplied: Boolean(volunteer),
    status: volunteer ? volunteer.status : null
  });
});

// Create a new volunteer application

export const applyVolunteer = asyncHandler(async (req, res) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login first."
      });
    }

    const existingVolunteer = await Volunteer.findOne({ user: req.userId })
      .select("_id")
      .lean();

    if (existingVolunteer) {
      return res.status(409).json({
        success: false,
        message: "You have already submitted a volunteer application."
      });
    }

    const {
      fullName,
      email,
      phone,
      dob,
      city,
      state,
      interests,
      mode,
      availability,
      profession,
      occupation,
      education,
      skills,
      idType,
      idNumber,
      emergencyName,
      emergencyPhone,
      bgCheck,
      motivation,
      declaration
    } = req.body;

    // Only Aadhaar and PAN are accepted
    if (idType !== "Aadhaar" && idType !== "PAN") {
      return res.status(400).json({
        success: false,
        message: "Only Aadhaar Card or PAN Card are accepted as ID type"
      });
    }

    // Validate Aadhaar format: 12 digits, must not start with 0 or 1
    if (idType === "Aadhaar" && !/^[2-9]\d{11}$/.test(String(idNumber || "").trim())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 12-digit Aadhaar number (must not start with 0 or 1)"
      });
    }

    // Validate PAN format: 5 letters + 4 digits + 1 letter
    if (idType === "PAN" && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(idNumber || "").trim().toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid PAN number (e.g., ABCDE1234F)"
      });
    }

    const interestsArray = Array.isArray(interests)
      ? interests
      : interests
        ? [interests]
        : [];

    if (interestsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one area of interest"
      });
    }

    const validProfessions = [
      'Doctor',
      'Nurse / Healthcare Worker',
      'Teacher / Educator',
      'Engineer',
      'Lawyer / Legal Professional',
      'Social Worker',
      'Student',
      'Business Owner / Entrepreneur',
      'IT Professional',
      'Accountant / CA',
      'Farmer',
      'Government Employee',
      'NGO Worker',
      'Retired',
      'Homemaker',
      'Other'
    ];

    if (!profession || !validProfessions.includes(profession)) {
      return res.status(400).json({
        success: false,
        message: `Please select a valid profession. Valid options: ${validProfessions.join(', ')}`
      });
    }

    // Verify that the user has actually completed KYC verification
    const user = await User.findById(req.userId).select("aadhaarVerified panVerified").lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let kycVerified = false;
    if (idType === "Aadhaar" && user.aadhaarVerified) kycVerified = true;
    if (idType === "PAN" && user.panVerified) kycVerified = true;

    if (!kycVerified) {
      return res.status(400).json({
        success: false,
        message: `Please verify your ${idType} via OTP before submitting the application.`
      });
    }

    const toBool = (value) => value === true || value === "true";

    const volunteer = await Volunteer.create({
      user: req.userId,
      fullName,
      email,
      phone,
      dob,
      city,
      state,
      interests: interestsArray,
      mode,
      availability,
      profession,
      occupation,
      education,
      skills,
      idType,
      idNumber,
      idVerified: true,
      emergencyName,
      emergencyPhone,
      bgCheck: toBool(bgCheck),
      motivation,
      declaration: toBool(declaration)
    });

    // Send application confirmation email (non-blocking)
    setImmediate(() => {
      sendVolunteerApplicationEmail({
        fullName: volunteer.fullName,
        email: volunteer.email
      }).catch(err => console.error("[mail] Volunteer application email failed:", err.message));
    });

    return res.status(201).json(
      new ApiResponse(201, "Volunteer application submitted successfully", volunteer)
    );

});

/**
 * GET /api/volunteer/profession-stats   (public — for dashboard display)
 * GET /api/admin/volunteers/profession-stats  (admin — includes full breakdown)
 *
 * Returns count of volunteers per profession.
 * Admin version also includes status breakdown (Pending/Approved/Rejected) per profession.
 */
export const getProfessionStats = asyncHandler(async (req, res) => {
  const isAdmin = req.query.detailed === "true";

  // ── Total approved volunteers per profession ─────────────────────────────
  const byProfession = await Volunteer.aggregate([
    { $match: { profession: { $exists: true, $ne: null } } },
    {
      $group: {
        _id: "$profession",
        total:    { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] } },
        pending:  { $sum: { $cond: [{ $eq: ["$status", "Pending"]  }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] } },
      },
    },
    { $sort: { approved: -1 } },
  ]);

  // ── Summary totals ────────────────────────────────────────────────────────
  const totalVolunteers  = await Volunteer.countDocuments({});
  const totalApproved    = await Volunteer.countDocuments({ status: "Approved" });
  const withProfession   = await Volunteer.countDocuments({ profession: { $exists: true, $ne: null } });

  // ── Spotlight: doctors and teachers (the two the user asked for) ──────────
  const doctorCount  = byProfession.find(p => p._id === "Doctor")?.approved  ?? 0;
  const teacherCount = byProfession.find(p => p._id === "Teacher / Educator")?.approved ?? 0;
  const nurseCount   = byProfession.find(p => p._id === "Nurse / Healthcare Worker")?.approved ?? 0;
  const engineerCount= byProfession.find(p => p._id === "Engineer")?.approved ?? 0;

  // ── State-wise breakdown of approved professionals (admin only) ───────────
  let stateBreakdown = [];
  if (isAdmin) {
    stateBreakdown = await Volunteer.aggregate([
      { $match: { status: "Approved", profession: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: { state: "$state", profession: "$profession" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
  }

  return res.status(200).json(
    new ApiResponse(200, "Volunteer profession stats fetched", {
      summary: {
        totalVolunteers,
        totalApproved,
        withProfession,
        // Sidebar-ready spotlight numbers
        doctors:   doctorCount,
        teachers:  teacherCount,
        nurses:    nurseCount,
        engineers: engineerCount,
      },
      byProfession,       // full per-profession breakdown (total/approved/pending/rejected)
      ...(isAdmin && { stateBreakdown }),
    })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/volunteer/profile
// Update volunteer-specific fields (motivation, skills, interests, etc.)
// ─────────────────────────────────────────────────────────────────────────────
export const updateVolunteerProfile = asyncHandler(async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please login first."
    });
  }

  // Find user's latest volunteer record
  const volunteer = await Volunteer.findOne({ user: req.userId })
    .sort({ createdAt: -1 }); // Get latest if multiple

  if (!volunteer) {
    return res.status(404).json({
      success: false,
      message: "Volunteer record not found. Please apply to become a volunteer first."
    });
  }

  // ✅ BLOCKED FIELDS: Common fields that sync from User model
  // These can ONLY be updated via User Profile endpoints to maintain data consistency
  const blockedCommonFields = ['email', 'phone', 'city', 'state'];
  
  // Check if user tried to update any blocked fields
  const attemptedBlockedFields = blockedCommonFields.filter(field => 
    typeof req.body[field] !== "undefined"
  );
  
  if (attemptedBlockedFields.length > 0) {
    console.warn(
      `⚠️  [BLOCKED] User ${req.userId} attempted to update common fields: ${attemptedBlockedFields.join(', ')}`
    );
    return res.status(400).json({
      success: false,
      message: `Cannot update these fields here: ${attemptedBlockedFields.join(', ')}. These are linked to your Profile. Update them in Profile → Personal Info`,
      blockedFields: attemptedBlockedFields,
      info: "Common fields (email, phone, city, state) are managed through your User Profile and synced automatically to maintain data consistency."
    });
  }

  // ✅ Update volunteer-specific fields (safe fields only)
  const safeFields = [
    'fullName',
    'dob',
    'profession',
    'occupation',
    'education',
    'skills',
    'interests',
    'mode',
    'availability',
    'motivation',    // ← KEY FIELD: No character limit
    'emergencyName',
    'emergencyPhone'
  ];

  const updates = {};
  safeFields.forEach(field => {
    if (typeof req.body[field] !== "undefined") {
      if (field === 'interests' && Array.isArray(req.body[field])) {
        updates[field] = req.body[field];
      } else if (field !== 'interests') {
        updates[field] = String(req.body[field] || "").trim();
      }
    }
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No volunteer profile changes provided"
    });
  }

  // Update volunteer record
  const updatedVolunteer = await Volunteer.findByIdAndUpdate(
    volunteer._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!updatedVolunteer) {
    return res.status(404).json({
      success: false,
      message: "Failed to update volunteer profile"
    });
  }

  // Log activity
  const updatedFields = Object.keys(updates);
  await createActivity(
    req.userId,
    'volunteer_profile_update',
    'Updated volunteer profile information',
    `Updated: ${updatedFields.join(', ')}`,
    null,
    {},
    {
      fieldsUpdated: updatedFields,
      updateCount: updatedFields.length,
    }
  );

  return res.status(200).json({
    success: true,
    message: "Volunteer profile updated successfully",
    data: {
      _id: updatedVolunteer._id,
      fullName: updatedVolunteer.fullName,
      dob: updatedVolunteer.dob,
      profession: updatedVolunteer.profession,
      occupation: updatedVolunteer.occupation,
      education: updatedVolunteer.education,
      skills: updatedVolunteer.skills,
      interests: updatedVolunteer.interests,
      mode: updatedVolunteer.mode,
      availability: updatedVolunteer.availability,
      motivation: updatedVolunteer.motivation,
      status: updatedVolunteer.status,
      updatedFields: updatedFields
    }
  });
});
