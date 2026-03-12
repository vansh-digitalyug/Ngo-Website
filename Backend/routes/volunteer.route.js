
import express from "express";
import { applyVolunteer, getVolunteerStatus } from "../controllers/volunteer.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/status", verifyToken, getVolunteerStatus);
router.post("/apply", verifyToken, applyVolunteer);

export default router;
