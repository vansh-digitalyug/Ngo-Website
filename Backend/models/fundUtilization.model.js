import mongoose from "mongoose";

const fundUtilizationSchema = new mongoose.Schema(
  {
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ngo",
      required: [true, "NGO ID is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxLength: [150, "Title cannot exceed 150 characters"],
      example: "Medical supplies & Surgeries (60%)",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxLength: [2000, "Description cannot exceed 2000 characters"],
    },
    percentage: {
      type: Number,
      required: [true, "Percentage is required"],
      min: [0, "Percentage cannot be less than 0"],
      max: [100, "Percentage cannot be more than 100"],
    },
    // S3 image key for the utilization image
    imageKey: {
      type: String,
      default: null,
      example: "Uploads/fund-utilization/medical-camp-2025.jpg",
    },
    // Display order for showing fund utilization items
    displayOrder: {
      type: Number,
      default: 0,
    },
    // Status: active or archived
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding fund utilization by NGO and status
fundUtilizationSchema.index({ ngoId: 1, status: 1 });

export default mongoose.model("FundUtilization", fundUtilizationSchema);
