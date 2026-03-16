import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  getImages,
  getVideos,
  getCategories,
  searchGallery,
  getAllGalleryItems,
  addImage,
  addVideo,
  updateGalleryItem,
  deleteGalleryItem,
  bulkDeleteGalleryItems,
  approveGalleryItem,
  rejectGalleryItem
} from "../controllers/gallery.controller.js";

const router = express.Router();

// Create gallery uploads directory if it doesn't exist
const galleryUploadDir = path.join(process.cwd(), "uploads", "gallery");
if (!fs.existsSync(galleryUploadDir)) {
  fs.mkdirSync(galleryUploadDir, { recursive: true });
}

// Multer configuration for gallery images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, galleryUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `gallery-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ============================================
// PUBLIC ROUTES
// ============================================

// Get all images (public)
router.get("/images", getImages);

// Get all videos (public)
router.get("/videos", getVideos);

// Get categories with counts
router.get("/categories", getCategories);

// Search gallery (public)
router.get("/search", searchGallery);

// ============================================
// ADMIN ROUTES
// ============================================

// Get all gallery items (admin)
router.get("/admin/all", authenticate, verifyAdmin, getAllGalleryItems);

// Add new image (admin)
router.post("/admin/image", authenticate, verifyAdmin, upload.single("image"), addImage);

// Add new video (admin) - with thumbnail upload support
router.post("/admin/video", authenticate, verifyAdmin, upload.single("thumbnail"), addVideo);

// Update gallery item (admin)
router.put("/admin/:id", authenticate, verifyAdmin, updateGalleryItem);

// Approve gallery item (admin)
router.put("/admin/:id/approve", authenticate, verifyAdmin, approveGalleryItem);

// Reject gallery item (admin)
router.put("/admin/:id/reject", authenticate, verifyAdmin, rejectGalleryItem);

// Delete gallery item (admin)
router.delete("/admin/:id", authenticate, verifyAdmin, deleteGalleryItem);

// Bulk delete gallery items (admin)
router.post("/admin/bulk-delete", authenticate, verifyAdmin, bulkDeleteGalleryItems);

export default router;
