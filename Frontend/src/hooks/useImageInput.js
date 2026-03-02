// hooks/useImageInput.js
import { useState } from "react";
import { useS3Upload } from "./useS3Upload";

export const useImageInput = () => {
  const { uploadFile, uploading, error } = useS3Upload();

  const [imageKey, setImageKey] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // allow only images
    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed");
      return;
    }

    // preview
    setPreview(URL.createObjectURL(file));

    try {
      // auto upload to S3
      const key = await uploadFile(file);
      setImageKey(key);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return {
    handleImageChange,
    imageKey,
    preview,
    uploading,
    error,
  };
};