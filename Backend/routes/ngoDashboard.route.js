import express from "express";
import multer from "multer";
import path from "path";
import { requireNgoAuth, checkNgoStatus } from "../middlewares/ngoAuth.middleware.js";
import {
    getDashboardStats,
    getNgoProfile,
    updateNgoProfile,
    updateNgoDocuments,
    getNgoGallery,
    uploadToGallery,
    deleteGalleryItem,
    getNgoVolunteers,
    updateVolunteerStatus,
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
// FILE UPLOAD CONFIGURATION FOR NGO GALLERY
// ═══════════════════════════════════════════════════════════════════════════

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/gallery/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `ngo-${req.ngo._id}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
router.post("/gallery", requireNgoAuth, upload.single("image"), uploadToGallery);
router.delete("/gallery/:id", requireNgoAuth, deleteGalleryItem);

// Volunteers
router.get("/volunteers", requireNgoAuth, getNgoVolunteers);
router.put("/volunteers/:id", requireNgoAuth, updateVolunteerStatus);

// Fund Requests
router.post("/funds/request", requireNgoAuth, requestNgoFunds);
router.get("/funds", requireNgoAuth, getMyFundRequests);
router.put("/funds/:id/resolve", requireNgoAuth, resolveFundTicket);

// Donation History
router.get("/donations", requireNgoAuth, getNgoDonationHistory);

export default router;
