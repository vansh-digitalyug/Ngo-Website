// routes/s3.routes.js
import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { generateUploadUrl, getUrl, getFileUrl } from "../controllers/s3.controller.js";

const router = express.Router();

// Get presigned PUT URL for uploading a file to S3
router.post("/generate-upload-url", asyncHandler(generateUploadUrl));

// Get presigned GET URL (short-lived, for downloads or preview)
router.get("/get-url", asyncHandler(getUrl));

// Get public URL for display (bucket/object must be publicly readable)
router.get("/file-url", asyncHandler(getFileUrl));

export default router;