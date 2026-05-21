import express from "express";
import { requireNgoAuth } from "../middlewares/ngoAuth.middleware.js";
// Changed 'authMiddleware' to 'authenticate' to match your middleware exports
import { authenticate } from "../middlewares/auth.middleware.js"; 
import asyncHandler from "../utils/asyncHandler.js";
import {
  createFundUtilization,
  getFundUtilizationByNgo,
  getFundUtilizationById,
  updateFundUtilization,
  deleteFundUtilization,
  reorderFundUtilization,
  getFundUtilizationPublic,
} from "../controllers/fundUtilization.controller.js";

const router = express.Router();

// Public routes
router.get("/public/:ngoId", asyncHandler(getFundUtilizationPublic));

// Protected routes (NGO Admin only)
// Replaced 'authMiddleware' with 'authenticate' across all protected routes
router.post("/", authenticate, requireNgoAuth, asyncHandler(createFundUtilization));
router.get("/:ngoId", authenticate, requireNgoAuth, asyncHandler(getFundUtilizationByNgo));
router.get("/detail/:id", authenticate, requireNgoAuth, asyncHandler(getFundUtilizationById));
router.put("/:id", authenticate, requireNgoAuth, asyncHandler(updateFundUtilization));
router.delete("/:id", authenticate, requireNgoAuth, asyncHandler(deleteFundUtilization));
router.post("/:ngoId/reorder", authenticate, requireNgoAuth, asyncHandler(reorderFundUtilization));

export default router;