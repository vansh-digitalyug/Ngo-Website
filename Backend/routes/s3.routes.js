// routes/s3.routes.js
import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { generateUploadUrl, getUrl } from "../controllers/s3.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get presigned GET URL (short-lived, for downloads or preview) - PUBLIC endpoint
// This allows public NGO profiles to display images without authentication
router.get("/get-url", asyncHandler(getUrl));

// Protect remaining S3 routes with authentication
router.use(authenticate);

// Get presigned PUT URL for uploading a file to S3
router.post("/generate-upload-url", asyncHandler(generateUploadUrl));

// Get public URL for display (bucket/object must be publicly readable)


export default router;