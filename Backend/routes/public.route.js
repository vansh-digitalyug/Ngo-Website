import express from "express";
import { getPublicStats } from "../controllers/public.controller.js";

const router = express.Router();

// Public, no auth — used by the home page
router.get("/stats", getPublicStats);

export default router;
