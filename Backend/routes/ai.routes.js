import express from "express";
import { generateDescription, fixGrammar } from "../controllers/AI.generation.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

// Any authenticated user (admin, NGO, volunteer) can generate descriptions
router.post("/generate-description", verifyToken, asyncHandler(generateDescription));

// Fix grammar — public, no auth required (used on public forms too)
router.post("/fix-grammar", asyncHandler(fixGrammar));

export default router;
