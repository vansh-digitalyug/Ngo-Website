import express from "express";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    getComments,
    deleteComment,
} from "../controllers/communityPost.controller.js";

const router = express.Router();

// ─── Posts ────────────────────────────────────────────────────────────────────
router.get("/",     optionalAuth, getAllPosts);   // feed
router.post("/",    authenticate, createPost);    // create post
router.get("/:id",  optionalAuth, getPostById);   // single post + top comments
router.put("/:id",  authenticate, updatePost);    // edit own post
router.delete("/:id", authenticate, deletePost);  // delete own post

// ─── Likes ────────────────────────────────────────────────────────────────────
router.post("/:id/like", authenticate, toggleLike);  // toggle like

// ─── Comments ─────────────────────────────────────────────────────────────────
router.get("/:id/comments",    optionalAuth, getComments);  // list comments
router.post("/:id/comments",   authenticate, addComment);   // add comment / reply
router.delete("/comments/:commentId", authenticate, deleteComment); // delete comment

export default router;
