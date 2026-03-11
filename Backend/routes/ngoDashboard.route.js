import express from "express";
import { requireNgoAuth, checkNgoStatus } from "../middlewares/ngoAuth.middleware.js";
import {
    getDashboardStats,
    getNgoProfile,
    updateNgoProfile,
    updateNgoDocuments,
    getNgoGallery,
    generateGalleryUploadUrl,
    uploadToGallery,
    deleteGalleryItem,
    getNgoVolunteers,
    updateVolunteerStatus,
    addNgoVolunteer,
    getNgoStatus,
    getNgoDonationHistory
} from "../controllers/ngoDashboard.controller.js";
import {
    requestNgoFunds,
    getMyFundRequests,
    resolveFundTicket
} from "../controllers/ngo.controller.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
// NGO STATUS CHECK (No strict auth required - for pending page)
// ═══════════════════════════════════════════════════════════════════════════

router.get("/status", checkNgoStatus, getNgoStatus);

// ═══════════════════════════════════════════════════════════════════════════
// PROTECTED ROUTES - Require verified NGO
// ═══════════════════════════════════════════════════════════════════════════

// Dashboard
router.get("/dashboard", requireNgoAuth, getDashboardStats);

// Profile
router.get("/profile", requireNgoAuth, getNgoProfile);
router.put("/profile", requireNgoAuth, updateNgoProfile);

// Gallery
router.get("/gallery", requireNgoAuth, getNgoGallery);
router.get("/gallery/upload-url", requireNgoAuth, generateGalleryUploadUrl);
router.post("/gallery", requireNgoAuth, uploadToGallery);
router.delete("/gallery/:id", requireNgoAuth, deleteGalleryItem);

// Volunteers
router.get("/volunteers", requireNgoAuth, getNgoVolunteers);
router.post("/volunteers/add", requireNgoAuth, addNgoVolunteer);
router.put("/volunteers/:id", requireNgoAuth, updateVolunteerStatus);

// Fund Requests
router.post("/funds/request", requireNgoAuth, requestNgoFunds);
router.get("/funds", requireNgoAuth, getMyFundRequests);
router.put("/funds/:id/resolve", requireNgoAuth, resolveFundTicket);

// Donation History
router.get("/donations", requireNgoAuth, getNgoDonationHistory);

export default router;
