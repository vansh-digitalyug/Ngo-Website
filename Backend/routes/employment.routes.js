import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { requireNgoAuth } from "../middlewares/ngoAuth.middleware.js";
import { listPublic, getMyJobs, createJob, updateJob, deleteJob, adminGetAll } from "../controllers/employment.controller.js";

const router = express.Router();

// Public
router.get("/",            listPublic);

// Admin
router.get("/admin/all",   authenticate, verifyAdmin, adminGetAll);

// NGO
router.get("/my",          requireNgoAuth, getMyJobs);
router.post("/",           requireNgoAuth, createJob);
router.put("/:id",         requireNgoAuth, updateJob);
router.delete("/:id",      requireNgoAuth, deleteJob);

export default router;
