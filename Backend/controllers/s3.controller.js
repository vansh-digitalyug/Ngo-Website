// controllers/s3.controller.js
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3Client.config.js";
import ApiResponse from "../utils/Apiresponse.js";
import ApiError from "../utils/ApiError.js";

// Allowed S3 sub-folders — prevents path traversal attacks
const ALLOWED_LOCATIONS = new Set([
  "services/programs",
  "services/programs/gallery",
  "services/categories",
  "gallery",
  "team",
  "events",
  "blogs",
  "misc",
]);

export const generateUploadUrl = async (req, res) => {
  const { fileType, fileName, location } = req.body;

  if (!fileType) throw new ApiError(400, "fileType is required");
  if (!fileName) throw new ApiError(400, "fileName is required");

  const loc = location || "services/programs";
  if (!ALLOWED_LOCATIONS.has(loc)) {
    throw new ApiError(400, `Invalid location. Allowed: ${[...ALLOWED_LOCATIONS].join(", ")}`);
  }

  // Strip existing extension to avoid double extensions (e.g. photo.png.png)
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const parts = fileType.split("/");
  if (parts.length !== 2 || !parts[1]) throw new ApiError(400, "Invalid fileType format");
  const ext = parts[1];

  const key = `Uploads/${loc}/${baseName}.${ext}`;
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min

  res.json(new ApiResponse(200, "Upload URL generated", { uploadUrl, key }));
};

// Generate a presigned URL for downloading a file given its key
export const getUrl = async (req, res) => {
  const key = req.body?.key || req.query?.key;
  if (!key) throw new ApiError(400, "Key is required");

  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  });

  const Url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour

  res.json(new ApiResponse(200, "Download URL generated", { Url }));
};

// Return a public URL for the object (assumes bucket/object is public-read)
export const getFileUrl = (req, res) => {
  const key = req.body?.key || req.query?.key || req.params?.key;
  if (!key) throw new ApiError(400, "Key is required");

  if (!process.env.BUCKET_NAME) throw new ApiError(500, "Bucket name not configured");

  const region = process.env.AWS_REGION ? `${process.env.AWS_REGION}.` : "";
  const url = `https://${process.env.BUCKET_NAME}.s3.${region}amazonaws.com/${key}`;
  res.json(new ApiResponse(200, "File URL", { url }));
};
