import Ngo from "../models/ngo.model.js";
import FundRequest from "../models/fundRequest.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const toBool = (value) => value === true || value === "true" || value === "on";

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // Not JSON array, continue with CSV/single-value handling.
    }

    return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const getUploadedFileName = (files, fieldName) => {
  const file = files?.[fieldName]?.[0];
  return file?.filename || "";
};

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

// GET all NGOs with optional filters
export const getAllNgos = async (req, res) => {
  try {
    const { category, city, search, page = 1, limit = 12 } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { ngoName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }
    
    if (city) {
      filter.city = city;
    }
    
    if (category) {
      filter.services = { $in: [category] };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch NGOs (get all fields for better filtering display)
    const ngos = await Ngo.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .exec();

    // Get total count for pagination
    const total = await Ngo.countDocuments(filter);

    // Map isVerified to verified for frontend compatibility
    const mappedNgos = ngos.map(ngo => ({
      ...ngo.toObject(),
      verified: ngo.isVerified,
      rating: 4.8 // Default rating
    }));

    return res.status(200).json({
      success: true,
      data: mappedNgos,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch NGOs"
    });
  }
};

// GET single NGO by ID
export const getNgoById = async (req, res) => {
  try {
    const { id } = req.params;
    const ngo = await Ngo.findById(id);
    
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found"
      });
    }

    // Map isVerified to verified for frontend compatibility
    const ngoData = {
      ...ngo.toObject(),
      verified: ngo.isVerified,
      rating: 4.8 // Default rating
    };

    return res.status(200).json({
      success: true,
      data: ngoData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch NGO"
    });
  }
};

export const createNgo = async (req, res) => {
  try {
    const {
      ngoName,
      ngoS3Id,
      regType,
      regNumber,
      estYear,
      darpanId,
      panNumber,
      description,
      state,
      district,
      city,
      pincode,
      address,
      contactName,
      contactRole,
      phone,
      whatsapp,
      email,
      website,
      facebook,
      instagram,
      socialFacebook,
      socialInstagram,
      otherService,
      agreeToTerms,
      
      // S3 keys sent by frontend after direct-to-S3 upload
      registrationCertificate,
      certificate12A,
      certificate80G
    } = req.body;

    // Documents are S3 keys provided by the frontend after direct-to-S3 upload
    const documents = {
      registrationCertificate: registrationCertificate || "not found",
      certificate12A: certificate12A || "not found",
      certificate80G: certificate80G || "not found"
    };

    if (!documents.registrationCertificate) {
      return res.status(400).json({
        success: false,
        message: "Registration certificate is required"
      });
    }

    if (!toBool(agreeToTerms)) {
      return res.status(400).json({
        success: false,
        message: "You must agree to the terms"
      });
    }

    const ngo = await Ngo.create({
      ngoName,
      ngoS3Id,
      regType,
      regNumber,
      estYear: estYear ? Number(estYear) : undefined,
      darpanId,
      panNumber,
      description,
      state,
      district,
      city,
      pincode: pincode ? String(pincode).trim() : pincode,
      address,
      contactName,
      contactRole,
      phone: onlyDigits(phone),
      whatsapp: onlyDigits(whatsapp),
      email,
      website,
      documents,
      socialMedia: {
        facebook: facebook || socialFacebook || "",
        instagram: instagram || socialInstagram || ""
      },
      services: toArray(req.body.services),
      otherService,
      documents,
      agreeToTerms: true,
      // Link to logged-in user if available
      ownerId: req.user?._id || null
    });

    return res.status(201).json({
      success: true,
      message: "NGO registered successfully. Your application is under review.",
      ngo
    });
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.regNumber) {
      return res.status(409).json({
        success: false,
        message: "An NGO with this registration number already exists"
      });
    }

    const status = error.name === "ValidationError" ? 400 : 500;
    return res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

export const updateNgo = async (req, res) => {
  try {
    const ngo = req.ngo; // From auth middleware

    if (ngo.isVerified) {
      return res.apiError(403, "Verified NGOs cannot update their profile. Please contact support for any changes.");
    }

    const updateData = {};
    const allowedFields = [
      "ngoName", "regType", "regNumber", "estYear", "darpanId", "panNumber",
      "description", "state", "district", "city", "pincode", "address",
      "contactName", "contactRole", "phone", "whatsapp", "email",
      "website", "facebook", "instagram", "otherService"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle services array
    if (req.body.services !== undefined) {
      updateData.services = toArray(req.body.services);
    }

    // Handle document updates (S3 keys)
    const documentFields = ["registrationCertificate", "certificate12A", "certificate80G"];
    documentFields.forEach(docField => {
      if (req.body[docField] !== undefined) {
        updateData[docField] = req.body[docField]; // Expecting S3 key from frontend
      }
    });

    const updatedNgo = await Ngo.findByIdAndUpdate(ngo._id, updateData, { new: true });

    return res.status(200).json({
      success: true,
      message: "NGO profile updated successfully",
      ngo: updatedNgo
    });
  }
    catch (error) {
      if (error?.code === 11000 && error?.keyPattern?.regNumber) {
        return res.status(409).json({
          success: false,
          message: "An NGO with this registration number already exists"
        });
      }

      const status = error.name === "ValidationError" ? 400 : 500;
      return res.status(status).json({
        success: false,
        message: error.message
      });
    }
};
// ─── Fund Request: NGO submits a fund request ───
export const requestNgoFunds = asyncHandler(async (req, res) => {
    const ngo = req.ngo;

    const { amount, purpose, description } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
        throw new ApiError(400, "A valid amount greater than 0 is required");
    }

    if (!purpose || purpose.trim().length === 0) {
        throw new ApiError(400, "Purpose is required");
    }

    const fundRequest = await FundRequest.create({
        ngoId: ngo._id,
        ngoName: ngo.ngoName,
        amount: Number(amount),
        purpose: purpose.trim(),
        description: description?.trim() || ""
    });

    return res.status(201).json(
        new ApiResponse(201, "Fund request submitted successfully", fundRequest)
    );
});

// ─── Fund Request: NGO views their own fund requests ───
export const getMyFundRequests = asyncHandler(async (req, res) => {
    const ngo = req.ngo;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { ngoId: ngo._id };
    if (status && ["Pending", "Approved", "Released", "Rejected"].includes(status)) {
        filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
        FundRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
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

// ─── Fund Request: NGO resolves/acknowledges the ticket after funds are received ───
export const resolveFundTicket = asyncHandler(async (req, res) => {
    const ngo = req.ngo;
    const { id } = req.params;

    const fundRequest = await FundRequest.findOne({ _id: id, ngoId: ngo._id });

    if (!fundRequest) {
        throw new ApiError(404, "Fund request not found");
    }

    if (fundRequest.status !== "Released") {
        throw new ApiError(400, "You can only resolve a ticket after funds have been released by the admin");
    }

    if (fundRequest.isResolved) {
        throw new ApiError(400, "This ticket is already resolved");
    }

    fundRequest.isResolved = true;
    fundRequest.resolvedAt = new Date();
    await fundRequest.save();

    return res.status(200).json(
        new ApiResponse(200, "Fund request ticket resolved successfully", fundRequest)
    );
});


