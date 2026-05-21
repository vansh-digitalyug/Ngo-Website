import React, { useState, useEffect } from "react";
import { Upload, Edit2, Trash2, Plus, Loader } from "lucide-react";

const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

export default function NgoFundUtilization() {
  const [fundUtilizations, setFundUtilizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageKey, setUploadedImageKey] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    percentage: "",
    displayOrder: "",
  });

  const ngoId = (() => {
    try {
      return JSON.parse(localStorage.getItem("ngoData"))?._id;
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");

  // Fetch fund utilizations
  useEffect(() => {
    fetchFundUtilizations();
  }, []);

  const fetchFundUtilizations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/fund-utilization/${ngoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setFundUtilizations(data.data || []);
    } catch (error) {
      console.error("Error fetching fund utilizations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload to S3
  const handleImageUpload = async (file) => {
    if (!file) return;

    try {
      setUploading(true);

      // Step 1: Get presigned URL from backend
      const uploadRes = await fetch(`${API_BASE_URL}/api/s3/generate-upload-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileType: file.type,
          fileName: file.name,
          location: "fund-utilization",
          fileSize: file.size,
        }),
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.message);

      const { uploadUrl, key } = uploadData.data;

      // Step 2: Upload to S3
      const s3Response = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!s3Response.ok) throw new Error("S3 upload failed");

      setUploadedImageKey(key);
      setImagePreview(URL.createObjectURL(file));
      console.log("Image uploaded to S3:", key);
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.percentage) {
      alert("Please fill all required fields");
      return;
    }

    const percentage = parseFloat(formData.percentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      alert("Percentage must be between 0 and 100");
      return;
    }

    try {
      const payload = {
        ngoId,
        title: formData.title,
        description: formData.description,
        percentage,
        displayOrder: parseInt(formData.displayOrder) || 0,
        imageKey: uploadedImageKey,
      };

      const url = editingId
        ? `${API_BASE_URL}/api/fund-utilization/${editingId}`
        : `${API_BASE_URL}/api/fund-utilization`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert(editingId ? "Fund utilization updated successfully" : "Fund utilization created successfully");
        fetchFundUtilizations();
        resetForm();
      } else {
        alert(data.message || "Error saving fund utilization");
      }
    } catch (error) {
      console.error("Error saving fund utilization:", error);
      alert("Failed to save fund utilization");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      percentage: item.percentage.toString(),
      displayOrder: item.displayOrder.toString(),
    });
    setUploadedImageKey(item.imageKey);
    setEditingId(item._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this fund utilization entry?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/fund-utilization/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        alert("Fund utilization deleted successfully");
        fetchFundUtilizations();
      } else {
        alert(data.message || "Error deleting fund utilization");
      }
    } catch (error) {
      console.error("Error deleting fund utilization:", error);
      alert("Failed to delete fund utilization");
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", percentage: "", displayOrder: "" });
    setImageFile(null);
    setImagePreview(null);
    setUploadedImageKey(null);
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Fund Utilization</h1>
        <p className="text-slate-600">Manage how your NGO utilizes donations and funds</p>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          <Plus size={20} /> Add Fund Utilization
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-slate-200">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            {editingId ? "Edit Fund Utilization" : "Create Fund Utilization"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Medical supplies & Surgeries (60%)"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={150}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe how the funds are used..."
                rows="5"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={2000}
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.description.length}/2000
              </p>
            </div>

            {/* Percentage */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Percentage * (0-100)
              </label>
              <input
                type="number"
                value={formData.percentage}
                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                placeholder="60"
                min="0"
                max="100"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Upload Image
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="imageInput"
                  disabled={uploading}
                />
                <label htmlFor="imageInput" className="cursor-pointer flex flex-col items-center">
                  {uploading ? (
                    <>
                      <Loader className="animate-spin mb-2" size={32} />
                      <p>Uploading...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="mb-2" size={32} />
                      <p className="text-sm text-slate-600">
                        Click to upload image or drag and drop
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-xs h-auto rounded-lg border border-slate-300"
                  />
                  <p className="text-xs text-green-600 mt-2">✓ Image uploaded to S3</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-900 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {fundUtilizations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-slate-500 text-lg">No fund utilization entries yet. Create one to get started!</p>
          </div>
        ) : (
          fundUtilizations.map((item, idx) => (
            <div
              key={item._id}
              className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-6">
                {/* Image */}
                {item.imageKey && (
                  <div className="flex-shrink-0">
                    <img
                      src={`${API_BASE_URL}/api/s3/get-url?key=${encodeURIComponent(item.imageKey)}`}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                      <p className="text-slate-600 mt-1 line-clamp-2">{item.description}</p>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
                          {item.percentage}%
                        </span>
                        <span className="text-slate-500">Order: {item.displayOrder}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
