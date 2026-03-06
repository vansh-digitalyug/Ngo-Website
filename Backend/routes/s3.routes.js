// routes/s3.routes.js
import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { generateUploadUrl, getUrl, getFileUrl } from "../controllers/s3.controller.js";

const router = express.Router();

router.post("/generate-upload-url", asyncHandler(generateUploadUrl));
// presigned GET link (short-lived) for downloads or preview
router.get("/get-url", asyncHandler(getUrl));
// public URL for display (bucket/object must be publicly readable)


export default router;