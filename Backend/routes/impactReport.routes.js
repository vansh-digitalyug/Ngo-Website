import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { requireNgoAuth } from "../middlewares/ngoAuth.middleware.js";
import {
    listPublic, getPublicReport,
    getMyReports, createReport, updateReport, deleteReport,
    adminGetAll,
} from "../controllers/impactReport.controller.js";

const router = express.Router();

// Public
router.get("/public",         listPublic);
router.get("/public/:id",     getPublicReport);

// Admin
router.get("/admin/all",      authenticate, verifyAdmin, adminGetAll);

// NGO
router.get("/my",             requireNgoAuth, getMyReports);
router.post("/",              requireNgoAuth, createReport);
router.put("/:id",            requireNgoAuth, updateReport);
router.delete("/:id",         requireNgoAuth, deleteReport);

export default router;
