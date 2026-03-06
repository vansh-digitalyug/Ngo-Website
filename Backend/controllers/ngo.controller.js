import Ngo from "../models/ngo.model.js";

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
      registrationCertificate: registrationCertificate || "",
      certificate12A: certificate12A || "",
      certificate80G: certificate80G || ""
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
