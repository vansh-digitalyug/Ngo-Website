import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
    submitReport,
    getMyReports,
} from "../controllers/report.controller.js";

const router = express.Router();

// All report routes require authentication (reports need accountability)
router.use(authenticate);

/**
 * POST /api/report
 * Submit a report against an NGO, volunteer, community, activity, user, or content.
 * Body: { reportType, subject, description, severity?,
 *         targetId?, targetName?, targetModel?, evidenceUrls? }
 */
router.post("/", submitReport);

/**
 * GET /api/report/my
 * Get the logged-in user's own submitted reports.
 * Query: page, limit
 */
router.get("/my", getMyReports);

export default router;
