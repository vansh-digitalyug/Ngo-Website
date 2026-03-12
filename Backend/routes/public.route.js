import express from "express";
import { getPublicStats } from "../controllers/public.controller.js";
import { getAllCategories, getAllPrograms, getProgramById, getProgramsByCategory } from "../controllers/services.controller.js";

const router = express.Router();

// Public, no auth — used by the home page
router.get("/stats", getPublicStats);
router.get("/categories", getAllCategories);
router.get("/programs", getAllPrograms);
router.get("/programs/:programId", getProgramById);
router.get("/categories/:categoryId/programs", getProgramsByCategory);


export default router;
