import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { requireNgoAuth } from "../middlewares/ngoAuth.middleware.js";
import { listPublic, getOne, getMyJobs, createJob, updateJob, deleteJob, adminGetAll } from "../controllers/employment.controller.js";

const router = express.Router();

// Public
router.get("/",            listPublic);

// Admin — must be before /:id
router.get("/admin/all",   authenticate, verifyAdmin, adminGetAll);

// NGO — must be before /:id
router.get("/my",          requireNgoAuth, getMyJobs);
router.post("/",           requireNgoAuth, createJob);
router.put("/:id",         requireNgoAuth, updateJob);
router.delete("/:id",      requireNgoAuth, deleteJob);

// Parameterized — must be last to avoid swallowing /my and /admin/all
router.get("/:id",         getOne);

export default router;
