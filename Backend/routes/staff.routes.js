import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { requireNgoAuth } from "../middlewares/ngoAuth.middleware.js";
import { getMyStaff, addStaff, updateStaff, deleteStaff, adminGetAll, adminStats } from "../controllers/staff.controller.js";

const router = express.Router();

// Admin
router.get("/admin/all",   authenticate, verifyAdmin, adminGetAll);
router.get("/admin/stats", authenticate, verifyAdmin, adminStats);

// NGO
router.get("/my",          requireNgoAuth, getMyStaff);
router.post("/",           requireNgoAuth, addStaff);
router.put("/:id",         requireNgoAuth, updateStaff);
router.delete("/:id",      requireNgoAuth, deleteStaff);

export default router;
