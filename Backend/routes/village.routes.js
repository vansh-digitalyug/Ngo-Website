import express from "express";
import { authenticate, optionalAuth } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { requireNgoAuth } from "../middlewares/ngoAuth.middleware.js";
import {
    listVillages,
    getVillage,
    getVillageProblems,
    submitProblem,
    submitProblemPublic,
    upvoteProblem,
    getMyVillages,
    createVillage,
    updateVillage,
    addMilestone,
    removeMilestone,
    updateProblemStatus,
    deleteVillage,
    adminListVillages,
    adminGetAllProblems,
    ngoGetMyProblems,
} from "../controllers/village.controller.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get("/",              listVillages);
router.get("/admin/all",      authenticate, verifyAdmin, adminListVillages);
router.get("/admin/problems", authenticate, verifyAdmin, adminGetAllProblems);
router.get("/my",               requireNgoAuth, getMyVillages);
router.get("/ngo/problems",     requireNgoAuth, ngoGetMyProblems);
router.get("/:id",           getVillage);
router.get("/:id/problems",  getVillageProblems);

// ── Submit & vote problem (public / optionalAuth) ─────────────────────────────
router.post("/problems/public",               optionalAuth, submitProblemPublic); // free-text village
router.post("/:id/problems",                  optionalAuth, submitProblem);       // adopted village
router.put("/problems/:problemId/upvote",     authenticate, upvoteProblem);
router.put("/problems/:problemId/status",     authenticate, updateProblemStatus);

// ── NGO management ────────────────────────────────────────────────────────────
router.post("/admin/create", authenticate, verifyAdmin, createVillage); // admin creates for any NGO
router.post("/",             requireNgoAuth, createVillage);             // NGO creates for itself
router.put("/:id",           requireNgoAuth, updateVillage);
router.post("/:id/milestone",           requireNgoAuth, addMilestone);
router.delete("/:id/milestone/:milestoneId", requireNgoAuth, removeMilestone);

// ── Admin only ────────────────────────────────────────────────────────────────
router.delete("/:id",        authenticate, verifyAdmin, deleteVillage);

export default router;
