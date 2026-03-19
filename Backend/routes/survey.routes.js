import express from "express";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { requireNgoAuth } from "../middlewares/ngoAuth.middleware.js";
import {
    getMySurveys, createSurvey, updateSurvey, deleteSurvey, getSurveyResults,
    getSurveyByToken, submitResponse, adminGetAll,
} from "../controllers/survey.controller.js";

const router = express.Router();

// Admin
router.get("/admin/all",          authenticate, verifyAdmin, adminGetAll);

// NGO
router.get("/my",                 requireNgoAuth, getMySurveys);
router.post("/",                  requireNgoAuth, createSurvey);
router.put("/:id",                requireNgoAuth, updateSurvey);
router.delete("/:id",             requireNgoAuth, deleteSurvey);
router.get("/:id/results",        requireNgoAuth, getSurveyResults);

// Public (share link)
router.get("/respond/:token",     getSurveyByToken);
router.post("/respond/:token",    optionalAuth, submitResponse);

export default router;
