import express from "express";
import { applyVolunteer, getVolunteerStatus, getProfessionStats } from "../controllers/volunteer.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/status", verifyToken, getVolunteerStatus);
router.post("/apply", verifyToken, applyVolunteer);

/**
 * GET /api/volunteer/profession-stats
 * Public — returns approved volunteer counts per profession.
 * Used on the public dashboard to show "X Doctors, Y Teachers...".
 * Add ?detailed=true for state-wise breakdown (admin use).
 */
router.get("/profession-stats", getProfessionStats);

export default router;
