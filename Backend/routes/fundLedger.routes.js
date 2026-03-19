import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { requireNgoAuth } from "../middlewares/ngoAuth.middleware.js";
import {
    getPublicLedger,
    getPlatformSummary,
    getMyLedger,
    getMySummary,
    addEntry,
    updateEntry,
    deleteEntry,
    adminGetAll,
} from "../controllers/fundLedger.controller.js";

const router = express.Router();

// ── Public transparency ───────────────────────────────────────────────────────
router.get("/public/summary",       getPlatformSummary);
router.get("/public/:ngoId",        getPublicLedger);

// ── NGO ───────────────────────────────────────────────────────────────────────
router.get("/",                     requireNgoAuth, getMyLedger);
router.get("/summary",              requireNgoAuth, getMySummary);
router.post("/",                    requireNgoAuth, addEntry);
router.put("/:id",                  requireNgoAuth, updateEntry);
router.delete("/:id",               requireNgoAuth, deleteEntry);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/admin/all",            authenticate, verifyAdmin, adminGetAll);
router.delete("/admin/:id",         authenticate, verifyAdmin, deleteEntry);

export default router;
