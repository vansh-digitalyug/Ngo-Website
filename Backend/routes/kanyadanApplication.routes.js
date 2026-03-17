import express from "express";
import {
  submitKanyadanApplication
} from "../controllers/kanyadanApplication.controller.js";
import { publicFormLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

// Public: anyone can submit an application
router.post("/apply", publicFormLimiter, submitKanyadanApplication);

export default router;
