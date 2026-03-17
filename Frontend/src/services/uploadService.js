// services/uploadService.js

import axios from "axios";

const API_BASE_URL = `${String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "")}/api`;

export const generateUploadUrl = async (fileType, fileName, location) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/s3/generate-upload-url`, {
      fileType,
      fileName,
      location,
    });
    return response.data.data; // Assuming the API response has a 'data' field
  } catch (error) {
    console.error("Error generating upload URL:", error);
    throw error;
  }
};

export const getDownloadUrl = async (key) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/s3/download-url/${key}`);
    return response.data.data; // Assuming the API response has a 'data' field
  } catch (error) {
    console.error("Error generating download URL:", error);
    throw error;
  }
};

export const uploadfileToS3 = async (file, uploadUrl) => {
  try {
    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};
