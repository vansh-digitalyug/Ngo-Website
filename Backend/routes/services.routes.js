import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
    // category
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    hideCategory,
    unhideCategory,
    // program
    createProgram,
    getAllPrograms,
    getProgramsByCategory,
    getProgramById,
    getProgramByTitle,
    getProgramByHref,
    updateProgram,
    deleteProgram,
    hideProgram,
    unhideProgram,
    hardDeleteProgram,
    // public combined
    getServicesWithPrograms,
} from "../controllers/services.controller.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────────────────────────────────────────

// All categories + their programs in one response (used by the frontend service page)
router.get("/", getServicesWithPrograms);

// Categories
router.get("/categories", getAllCategories);
router.get("/categories/:categoryId", getCategoryById);

// Programs
router.get("/programs", getAllPrograms);
router.get("/programs/by-title/:title", getProgramByTitle);
router.get("/programs/by-href", getProgramByHref);
router.get("/programs/:programId", getProgramById);
router.get("/categories/:categoryId/programs", getProgramsByCategory);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN (authenticate + verifyAdmin)
// ─────────────────────────────────────────────────────────────────────────────

// Categories
router.get("/admin/categories", authenticate, verifyAdmin, getAllCategories);
router.post("/admin/categories", authenticate, verifyAdmin, createCategory);
router.put("/admin/categories/:categoryId", authenticate, verifyAdmin, updateCategory);
router.put("/admin/categories/:categoryId/hide", authenticate, verifyAdmin, hideCategory);
router.put("/admin/categories/:categoryId/unhide", authenticate, verifyAdmin, unhideCategory);
router.delete("/admin/categories/:categoryId", authenticate, verifyAdmin, deleteCategory);

// Programs
router.post("/admin/programs", authenticate, verifyAdmin, createProgram);
router.put("/admin/programs/:programId", authenticate, verifyAdmin, updateProgram);
router.put("/admin/programs/:programId/hide", authenticate, verifyAdmin, hideProgram);
router.put("/admin/programs/:programId/unhide", authenticate, verifyAdmin, unhideProgram);
router.delete("/admin/programs/:programId", authenticate, verifyAdmin, deleteProgram);
router.delete("/admin/programs/:programId/hard", authenticate, verifyAdmin, hardDeleteProgram);

export default router;
