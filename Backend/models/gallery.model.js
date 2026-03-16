import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
  // Type: image or video
  type: {
    type: String,
    enum: ["image", "video"],
    required: [true, "Type is required"]
  },
  
  // Title/Caption
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxLength: [200, "Title cannot exceed 200 characters"]
  },
  
  // Description
  description: {
    type: String,
    trim: true,
    default: ""
  },
  
  // URL - For images: uploaded file path, For videos: YouTube/Vimeo URL
  url: {
    type: String,
    required: [true, "URL is required"]
  },
  
  // Thumbnail - For videos, store thumbnail image
  thumbnail: {
    type: String,
    default: ""
  },
  
  // Category/Album
  category: {
    type: String,
    enum: [
      "Food Distribution",
      "Medical Camps",
      "Education Programs",
      "Elder Care",
      "Women Empowerment",
      "Events",
      "Volunteer Activities",
      "Other"
    ],
    default: "Other"
  },
  
  // For ordering
  order: {
    type: Number,
    default: 0
  },
  
  // Visibility
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Who uploaded
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // --- NGO Gallery Support ---
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ngo",
    default: null  // null = platform gallery, ObjectId = NGO-specific gallery
  },
  
  // Approval status for NGO uploads
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved"  // Platform uploads are auto-approved, NGO uploads start as pending
  },
  
  rejectionReason: {
    type: String,
    default: ""
  },

  // If this item was auto-created from a volunteer task completion
  sourceTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
gallerySchema.index({ type: 1, isActive: 1, createdAt: -1 });
gallerySchema.index({ category: 1 });
gallerySchema.index({ ngoId: 1, approvalStatus: 1 });
gallerySchema.index({ title: "text", description: "text" });

export default mongoose.model("Gallery", gallerySchema);
