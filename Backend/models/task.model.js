import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  // ── Donation Reference ──────────────────────────────────────────────────────
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  donorName:       { type: String, trim: true, default: "" },
  donorEmail:      { type: String, trim: true, default: "" },
  donationAmount:  { type: Number, required: true },
  serviceTitle:    { type: String, trim: true, default: "" },

  // ── Volunteer Assignment ────────────────────────────────────────────────────
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Volunteer",
    required: true,
  },
  volunteerName:  { type: String, trim: true, default: "" },
  volunteerEmail: { type: String, trim: true, default: "" },

  // ── Admin who created task ──────────────────────────────────────────────────
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // ── Task Details ────────────────────────────────────────────────────────────
  title:       { type: String, trim: true, required: true },
  description: { type: String, trim: true, default: "" },
  adminNote:   { type: String, trim: true, default: "" }, // instructions for volunteer

  // ── Status ──────────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ["assigned", "in_progress", "completed"],
    default: "assigned",
  },

  // ── Volunteer Completion Media ───────────────────────────────────────────────
  mediaUrl:       { type: String, default: null },
  mediaType:      { type: String, enum: ["image", "video", null], default: null },
  mediaThumbnail: { type: String, default: null },
  volunteerNote:  { type: String, trim: true, default: "" },
  completedAt:    { type: Date, default: null },

  // ── Post-completion state ────────────────────────────────────────────────────
  addedToGallery:    { type: Boolean, default: false },
  galleryItemId:     { type: mongoose.Schema.Types.ObjectId, ref: "Gallery", default: null },
  notificationSent:  { type: Boolean, default: false },
}, { timestamps: true });

taskSchema.index({ donorId: 1, status: 1 });
taskSchema.index({ volunteerId: 1, status: 1 });
taskSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Task", taskSchema);
