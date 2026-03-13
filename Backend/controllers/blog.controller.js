import Blog from "../models/blog.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/Apiresponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create a new blog post
export const createBlog = asyncHandler(async (req, res) => {
    const { title, content, S3Imagekey } = req.body;
    if (!title || !content || !S3Imagekey) {
        throw new ApiError(400, "Title, content, and S3Imagekey are required");
    }
    const blog = await Blog.create({ title, content, S3Imagekey });
    res.status(201).json(new ApiResponse(201, "Blog created successfully", blog));
});

// Get all blog posts
export const getAllBlogs = asyncHandler(async (_req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, "Blogs retrieved successfully", blogs));
});

// Get a single blog post by ID
export const getBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) throw new ApiError(404, "Blog not found");
    res.status(200).json(new ApiResponse(200, "Blog retrieved successfully", blog));
});

// Update a blog post
export const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content, S3Imagekey } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (S3Imagekey) updates.S3Imagekey = S3Imagekey;
    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "At least one field (title, content, S3Imagekey) is required to update");
    }
    const blog = await Blog.findByIdAndUpdate(id, updates, { new: true });
    if (!blog) throw new ApiError(404, "Blog not found");
    res.status(200).json(new ApiResponse(200, "Blog updated successfully", blog));
});

// Delete a blog post
export const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) throw new ApiError(404, "Blog not found");
    res.status(200).json(new ApiResponse(200, "Blog deleted successfully", null));
});
