import mongoose from "mongoose";

const kanyadanApplicationSchema = new mongoose.Schema(
  {
    // Linked user account (set when submitted by a logged-in user)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },

    // Guardian / Parent details
    guardianName: { type: String, required: true, trim: true },
    mobile: {
      type: String,
      required: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"]
    },

    // Location
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    village: { type: String, trim: true, default: "" },

    // Girl's details
    girlName: { type: String, required: true, trim: true },
    girlAge: {
      type: Number,
      required: true,
      min: [1, "Minimum age is 1 year"],
      max: [12, "Maximum age is 12 years"]
    },

    // Eligibility
    annualIncome: {
      type: String,
      required: true,
      enum: ["below1L", "1to1.5L", "1.5to2L", "2to2.5L"]
    },

    // Source
    howHeard: { type: String, trim: true, default: "" },

    // Optional message
    message: { type: String, trim: true, default: "" },

    // Admin management
    status: {
      type: String,
      enum: ["Pending", "Under Review", "Approved", "Rejected"],
      default: "Pending"
    },
    adminNote: { type: String, trim: true, default: "" }
  },
  { timestamps: true }
);

// Index for efficient admin queries
kanyadanApplicationSchema.index({ status: 1, createdAt: -1 });
kanyadanApplicationSchema.index({ mobile: 1 });

const KanyadanApplication = mongoose.model("KanyadanApplication", kanyadanApplicationSchema);

export default KanyadanApplication;
