import express from "express";
import { optionalAuth } from "../middlewares/auth.middleware.js";
import { requireNgoAuth } from "../middlewares/ngoAuth.middleware.js";
import {
    applyForJob,
    getNgoApplications,
    updateApplicationStatus,
} from "../controllers/employmentApplication.controller.js";

const router = express.Router();

// Public — submit application (optionalAuth attaches req.user if logged in)
router.post("/", optionalAuth, applyForJob);

// NGO — view & manage applications
router.get("/ngo",          requireNgoAuth, getNgoApplications);
router.put("/:id/status",   requireNgoAuth, updateApplicationStatus);

export default router;
