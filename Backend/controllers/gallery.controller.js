import Gallery from "../models/gallery.model.js";
import fs from "fs";
import path from "path";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

// ============================================
// PUBLIC ENDPOINTS
// ============================================

export const getImages = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 20 } = req.query;

  const query = { type: "image", isActive: true };
  if (category && category !== "all") query.category = category;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [images, total] = await Promise.all([
    Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-uploadedBy"),
    Gallery.countDocuments(query)
  ]);

  return res.json({
    success: true,
    images,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    }
  });
});

export const getVideos = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 20 } = req.query;

  const query = { type: "video", isActive: true };
  if (category && category !== "all") query.category = category;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [videos, total] = await Promise.all([
    Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-uploadedBy"),
    Gallery.countDocuments(query)
  ]);

  return res.json({
    success: true,
    videos,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    }
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;

  const match = { isActive: true };
  if (type) match.type = type;

  const categories = await Gallery.aggregate([
    { $match: match },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return res.json({
    success: true,
    categories: categories.map(c => ({ name: c._id, count: c.count }))
  });
});

// ============================================
// ADMIN ENDPOINTS
// ============================================

export const getAllGalleryItems = asyncHandler(async (req, res) => {
  const { type, category, status, search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (type) query.type = type;
  if (category && category !== "all") query.category = category;
  if (status && status !== "all") query.approvalStatus = status;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [items, total, imageCount, videoCount, pendingCount] = await Promise.all([
    Gallery.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("uploadedBy", "name email")
      .populate("ngoId", "ngoName"),
    Gallery.countDocuments(query),
    Gallery.countDocuments({ type: "image" }),
    Gallery.countDocuments({ type: "video" }),
    Gallery.countDocuments({ approvalStatus: "pending" })
  ]);

  const itemsWithStatus = items.map(item => ({
    ...item.toObject(),
    status: item.approvalStatus
  }));

  return res.json({
    success: true,
    items: itemsWithStatus,
    counts: { images: imageCount, videos: videoCount, pending: pendingCount },
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    }
  });
});

export const addImage = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  if (!title || !title.trim()) {
    if (req.file.path) fs.unlinkSync(req.file.path);
    throw new ApiError(400, "Title is required");
  }

  try {
    const image = new Gallery({
      type: "image",
      title: title.trim(),
      description: description?.trim() || "",
      url: `/uploads/gallery/${req.file.filename}`,
      category: category || "Other",
      uploadedBy: req.user._id
    });

    await image.save();

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw error;
  }
});

export const addVideo = asyncHandler(async (req, res) => {
  const { title, description, url, category } = req.body;

  if (!title || !title.trim()) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    throw new ApiError(400, "Title is required");
  }

  if (!url || !url.trim()) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    throw new ApiError(400, "Video URL is required");
  }

  const videoUrl = url.trim();
  const isYouTube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
  const isVimeo = videoUrl.includes("vimeo.com");

  if (!isYouTube && !isVimeo) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    throw new ApiError(400, "Only YouTube and Vimeo URLs are supported");
  }

  let thumbnailPath = "";
  if (req.file) {
    thumbnailPath = `/uploads/gallery/${req.file.filename}`;
  } else if (isYouTube) {
    const videoId = extractYouTubeId(videoUrl);
    if (videoId) thumbnailPath = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  try {
    const video = new Gallery({
      type: "video",
      title: title.trim(),
      description: description?.trim() || "",
      url: videoUrl,
      thumbnail: thumbnailPath,
      category: category || "Other",
      uploadedBy: req.user._id
    });

    await video.save();

    return res.status(201).json({
      success: true,
      message: "Video added successfully",
      video
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    throw error;
  }
});

export const updateGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, isActive, order } = req.body;

  const item = await Gallery.findById(id);
  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  if (title !== undefined) item.title = title.trim();
  if (description !== undefined) item.description = description.trim();
  if (category !== undefined) item.category = category;
  if (isActive !== undefined) item.isActive = isActive;
  if (order !== undefined) item.order = order;

  await item.save();

  return res.json({
    success: true,
    message: "Item updated successfully",
    item
  });
});

export const deleteGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await Gallery.findById(id);
  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  if (item.type === "image" && item.url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), item.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  if (item.type === "video" && item.thumbnail && item.thumbnail.startsWith("/uploads/")) {
    const thumbPath = path.join(process.cwd(), item.thumbnail);
    if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
  }

  await Gallery.findByIdAndDelete(id);

  return res.json({
    success: true,
    message: `${item.type === "image" ? "Image" : "Video"} deleted successfully`
  });
});

export const bulkDeleteGalleryItems = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, "No items selected");
  }

  const items = await Gallery.find({ _id: { $in: ids } });

  for (const item of items) {
    if (item.type === "image" && item.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), item.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    if (item.type === "video" && item.thumbnail && item.thumbnail.startsWith("/uploads/")) {
      const thumbPath = path.join(process.cwd(), item.thumbnail);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }
  }

  await Gallery.deleteMany({ _id: { $in: ids } });

  return res.json({
    success: true,
    message: `${ids.length} item(s) deleted successfully`
  });
});

export const approveGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const item = await Gallery.findById(id);
  if (!item) {
    throw new ApiError(404, "Gallery item not found");
  }

  item.approvalStatus = "approved";
  item.rejectionReason = "";
  await item.save();

  return res.json({
    success: true,
    message: `${item.type === "image" ? "Image" : "Video"} approved successfully`,
    item
  });
});

export const rejectGalleryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const item = await Gallery.findById(id);
  if (!item) {
    throw new ApiError(404, "Gallery item not found");
  }

  item.approvalStatus = "rejected";
  item.rejectionReason = reason || "Content not approved";
  await item.save();

  return res.json({
    success: true,
    message: `${item.type === "image" ? "Image" : "Video"} rejected`,
    item
  });
});

// Helper function to extract YouTube video ID
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}
