import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
    listPublic, getPublicReport,
    adminGetAll, autoGenerateReport, autoUpdateReport, deleteReport,
} from "../controllers/impactReport.controller.js";

const router = express.Router();

// Public
router.get("/public",         listPublic);
router.get("/public/:id",     getPublicReport);

// Admin
router.get("/admin/all",             authenticate, verifyAdmin, adminGetAll);
router.post("/admin/auto-generate",  authenticate, verifyAdmin, autoGenerateReport);
router.put("/admin/auto-update/:id", authenticate, verifyAdmin, autoUpdateReport);
router.delete("/:id",                authenticate, verifyAdmin, deleteReport);

export default router;
