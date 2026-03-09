import Volunteer from "../models/volunteer.model.js";
import User from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { sendVolunteerApplicationEmail } from "../services/mail.service.js";

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
