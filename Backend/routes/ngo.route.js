import express from "express";
import { createNgo, getAllNgos, getNgoById, getNgoGallery } from "../controllers/ngo.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Files are now uploaded directly to S3 from the frontend using presigned URLs.
// The /create route only receives JSON with S3 keys for the documents.
router.post(
  "/create",
  optionalAuth,  // Capture logged-in user if available
  createNgo
);

// GET routes
router.get("/", getAllNgos);
router.get("/:id/gallery", getNgoGallery);
router.get("/:id", getNgoById);

export default router;
