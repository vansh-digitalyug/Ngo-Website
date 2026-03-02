// hooks/useS3Upload.js
import { useState } from "react";

export const useS3Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // get pre-signed url from backend
  const getUploadUrl = async (fileType) => {
    const res = await fetch("/generate-upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileType }),
    });

    if (!res.ok) throw new Error("Failed to get upload URL");

    return res.json(); // { uploadUrl, key }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setError(null);

    let attempts = 0;

    try {
      while (attempts < 2) {
        // 1️⃣ get signed url
        const { uploadUrl, key } = await getUploadUrl(file.type);

        // 2️⃣ upload to S3
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        // success
        if (uploadRes.ok) {
          setUploading(false);
          return key; // save in DB
        }

        // expired URL → retry
        if (uploadRes.status === 403) {
          attempts++;
          continue;
        }

        throw new Error("Upload failed");
      }

      throw new Error("Upload failed after retry");
    } catch (err) {
      setError(err.message);
      setUploading(false);
      throw err;
    }
  };

  return {
    uploadFile,
    uploading,
    error,
  };
};