import Blog from "../models/blog.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3Client.config.js";

// Build a presigned GET URL from a stored S3 key (works even on private buckets)
async function buildImageUrl(key) {
    if (!key) return null;
    // Already a full URL (e.g. seed data using Unsplash links)
    if (key.startsWith("http://") || key.startsWith("https://")) return key;
    if (!process.env.BUCKET_NAME) return null;

    const command = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
    });
    // 7-day expiry — long enough that cached pages stay valid
    return await getSignedUrl(s3, command, { expiresIn: 7 * 24 * 3600 });
}

async function serializeBlog(blog) {
    const obj = blog.toObject ? blog.toObject() : { ...blog };
    obj.coverImageUrl = await buildImageUrl(obj.S3Imagekey);
    return obj;
}

// Create a new blog post
export const createBlog = asyncHandler(async (req, res) => {
    const { title, content, sections, S3Imagekey, excerpt, category, author } = req.body;
    if (!title || !S3Imagekey) {
        throw new ApiError(400, "Title and S3Imagekey are required");
    }
    const hasSections = Array.isArray(sections) && sections.some((s) => s.body?.trim());
    if (!hasSections && !content) {
        throw new ApiError(400, "Provide either content or at least one section with body text");
    }
    const blog = await Blog.create({
        title,
        content: content || "",
        sections: hasSections ? sections : [],
        S3Imagekey,
        excerpt: excerpt || "",
        category: category || "General",
        author: author || "Admin Team",
    });
    res.status(201).json(new ApiResponse(201, "Blog created successfully", await serializeBlog(blog)));
});

// Get all blog posts
export const getAllBlogs = asyncHandler(async (_req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, "Blogs retrieved successfully", await Promise.all(blogs.map(serializeBlog))));
});

// Get a single blog post by ID
export const getBlogById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) throw new ApiError(404, "Blog not found");
    res.status(200).json(new ApiResponse(200, "Blog retrieved successfully", await serializeBlog(blog)));
});

// Update a blog post
export const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, content, sections, S3Imagekey, excerpt, category, author } = req.body;
    const updates = {};
    if (title) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (Array.isArray(sections)) updates.sections = sections;
    if (S3Imagekey) updates.S3Imagekey = S3Imagekey;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (category) updates.category = category;
    if (author) updates.author = author;
    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "At least one field is required to update");
    }
    const blog = await Blog.findByIdAndUpdate(id, updates, { new: true });
    if (!blog) throw new ApiError(404, "Blog not found");
    res.status(200).json(new ApiResponse(200, "Blog updated successfully", await serializeBlog(blog)));
});

// Delete a blog post
export const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) throw new ApiError(404, "Blog not found");
    res.status(200).json(new ApiResponse(200, "Blog deleted successfully", null));
});
