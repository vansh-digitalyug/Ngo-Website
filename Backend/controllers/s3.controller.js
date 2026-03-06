// controllers/s3.controller.js
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3Client.config.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const generateUploadUrl = async (req, res) => {
  const { fileType, fileName,location } = req.body;
  if (!fileType) {
    throw new ApiError(400, "fileType is required");
  }
  if (!fileName) {
    throw new ApiError(400, "fileName is required");
  }

  // Strip any existing extension from fileName to avoid double extensions (e.g. photo.png.png)
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  const ext = fileType.split("/")[1];
  const key = `Uploads/${location}/${baseName}.${ext}`;
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 60, // 60 sec
  });

  res.json(new ApiResponse(200, "Upload URL generated", { uploadUrl, key }));
};

// generate a signed URL for downloading a file given its key
export const getUrl = async (req, res) => {
  // key can come from body or query parameters
  const { key } = req.body || req.query;
  if (!key) {
    throw new ApiError(400, "Key is required");
  }

  const command = new GetObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  });

  const Url = await getSignedUrl(s3, command, {
    expiresIn: 60000, // 60 sec
  });

  res.json(new ApiResponse(200, "Download URL generated", { Url }));
};

// return a public URL for the object (assumes bucket or object is public-read)
export const getFileUrl = (req, res) => {
  // key may be in body or query
  const { key } = req.body || req.query ||req.params;
  if (!key) {
    throw new ApiError(400, "Key is required");
  }

  if (!process.env.BUCKET_NAME) {
    throw new ApiError(500, "Bucket name not configured");
  }

  const region = process.env.AWS_REGION ? `${process.env.AWS_REGION}.` : "";
  const url = `https://${process.env.BUCKET_NAME}.s3.${region}amazonaws.com/${key}`;
  res.json(new ApiResponse(200, "File URL", { url }));
};