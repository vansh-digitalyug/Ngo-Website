import FundUtilization from "../models/fundUtilization.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// Create a new fund utilization entry
export const createFundUtilization = async (req, res) => {
  const { title, description, percentage, imageKey, displayOrder } = req.body;
  const ngoId = req.ngo?._id || req.body.ngoId;

  if (!ngoId) throw new ApiError(400, "NGO ID is required");
  if (!title) throw new ApiError(400, "Title is required");
  if (!description) throw new ApiError(400, "Description is required");
  if (percentage === undefined || percentage === null) {
    throw new ApiError(400, "Percentage is required");
  }

  if (percentage < 0 || percentage > 100) {
    throw new ApiError(400, "Percentage must be between 0 and 100");
  }

  const fundUtilization = await FundUtilization.create({
    ngoId,
    title,
    description,
    percentage,
    imageKey: imageKey || null,
    displayOrder: displayOrder || 0,
    createdBy: req.user?._id,
  });

  res.status(201).json(
    new ApiResponse(201, "Fund utilization created successfully", fundUtilization)
  );
};

// Get all fund utilization entries for an NGO
export const getFundUtilizationByNgo = async (req, res) => {
  const { ngoId } = req.params;

  if (!ngoId) throw new ApiError(400, "NGO ID is required");

  const fundUtilizations = await FundUtilization.find({
    ngoId,
    status: "active",
  }).sort({ displayOrder: 1, createdAt: -1 });

  if (!fundUtilizations || fundUtilizations.length === 0) {
    res.json(
      new ApiResponse(200, "No fund utilization data available yet", [])
    );
    return;
  }

  res.json(
    new ApiResponse(
      200,
      "Fund utilization data retrieved successfully",
      fundUtilizations
    )
  );
};

// Get fund utilization by ID
export const getFundUtilizationById = async (req, res) => {
  const { id } = req.params;

  const fundUtilization = await FundUtilization.findById(id);

  if (!fundUtilization) {
    throw new ApiError(404, "Fund utilization entry not found");
  }

  res.json(
    new ApiResponse(
      200,
      "Fund utilization retrieved successfully",
      fundUtilization
    )
  );
};

// Update fund utilization entry
export const updateFundUtilization = async (req, res) => {
  const { id } = req.params;
  const { title, description, percentage, imageKey, displayOrder, status } = req.body;

  const fundUtilization = await FundUtilization.findById(id);

  if (!fundUtilization) {
    throw new ApiError(404, "Fund utilization entry not found");
  }

  // Update fields if provided
  if (title !== undefined) fundUtilization.title = title;
  if (description !== undefined) fundUtilization.description = description;
  if (percentage !== undefined) {
    if (percentage < 0 || percentage > 100) {
      throw new ApiError(400, "Percentage must be between 0 and 100");
    }
    fundUtilization.percentage = percentage;
  }
  if (imageKey !== undefined) fundUtilization.imageKey = imageKey;
  if (displayOrder !== undefined) fundUtilization.displayOrder = displayOrder;
  if (status !== undefined) fundUtilization.status = status;
  fundUtilization.updatedBy = req.user?._id;

  await fundUtilization.save();

  res.json(
    new ApiResponse(200, "Fund utilization updated successfully", fundUtilization)
  );
};

// Delete fund utilization entry
export const deleteFundUtilization = async (req, res) => {
  const { id } = req.params;

  const fundUtilization = await FundUtilization.findByIdAndDelete(id);

  if (!fundUtilization) {
    throw new ApiError(404, "Fund utilization entry not found");
  }

  res.json(
    new ApiResponse(200, "Fund utilization deleted successfully", fundUtilization)
  );
};

// Reorder fund utilization entries
export const reorderFundUtilization = async (req, res) => {
  const { ngoId } = req.params;
  const { items } = req.body; // Array of { id, displayOrder }

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Items array is required");
  }

  const updatePromises = items.map((item) =>
    FundUtilization.findByIdAndUpdate(
      item.id,
      { displayOrder: item.displayOrder },
      { new: true }
    )
  );

  const updated = await Promise.all(updatePromises);

  res.json(
    new ApiResponse(200, "Fund utilization order updated successfully", updated)
  );
};

// Get fund utilization for public profile
export const getFundUtilizationPublic = async (req, res) => {
  const { ngoId } = req.params;

  if (!ngoId) throw new ApiError(400, "NGO ID is required");

  const fundUtilizations = await FundUtilization.find({
    ngoId,
    status: "active",
  })
    .select("title description percentage imageKey")
    .sort({ displayOrder: 1 });

  res.json(
    new ApiResponse(
      200,
      fundUtilizations.length > 0
        ? "Fund utilization data retrieved"
        : "No fund utilization data available yet",
      fundUtilizations
    )
  );
};
