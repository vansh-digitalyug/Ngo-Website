import express from "express";
import {
  submitKanyadanApplication
} from "../controllers/kanyadanApplication.controller.js";

const router = express.Router();

// Public: anyone can submit an application
router.post("/apply", submitKanyadanApplication);

export default router;
