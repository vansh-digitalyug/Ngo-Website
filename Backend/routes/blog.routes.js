import express from "express";
import { createBlog, getAllBlogs, getBlogById, deleteBlog, updateBlog } from "../controllers/blog.controller.js";

const router = express.Router();

router.get("/get-all-blog", getAllBlogs);
router.get("/get-blog/:id", getBlogById);
router.post("/create-blog", createBlog);
router.put("/update-blog/:id", updateBlog);
router.delete("/delete-blog/:id", deleteBlog);

export default router;
