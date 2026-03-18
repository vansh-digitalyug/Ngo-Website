import express from "express";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import {
    submitFeedback,
    getMyFeedback,
} from "../controllers/feedback.controller.js";

const router = express.Router();

/**
 * POST /api/feedback
 * Submit feedback. Works for both anonymous (optionalAuth) and logged-in users.
 * Body: { name, email, phone?, feedbackType, subject, message,
 *         rating?, targetId?, targetName?, targetModel? }
 */
router.post("/", optionalAuth, submitFeedback);

/**
 * GET /api/feedback/my
 * Logged-in user's own submitted feedback history.
 * Query: page, limit
 */
router.get("/my", authenticate, getMyFeedback);

export default router;
