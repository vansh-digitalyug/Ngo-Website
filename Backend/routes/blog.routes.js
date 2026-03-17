import express from "express";
import { createBlog, getAllBlogs, getBlogById, deleteBlog, updateBlog, generateBlogContent } from "../controllers/blog.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

// Public routes
router.get("/get-all-blog", asyncHandler(getAllBlogs));
router.get("/get-blog/:id", asyncHandler(getBlogById));

// Admin-only routes
router.post("/create-blog", verifyToken, verifyAdmin, asyncHandler(createBlog));
router.put("/update-blog/:id", verifyToken, verifyAdmin, asyncHandler(updateBlog));
router.delete("/delete-blog/:id", verifyToken, verifyAdmin, asyncHandler(deleteBlog));
router.post("/generate", verifyToken, verifyAdmin, asyncHandler(generateBlogContent));

export default router;
