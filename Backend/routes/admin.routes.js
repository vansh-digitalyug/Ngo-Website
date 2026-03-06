import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { adminLogin } from "../controllers/auth.controller.js";
import {
    getDashboardStats,
    getAllNgos,
    updateNgoStatus,
    deleteNgo,
    getAllVolunteers,
    updateVolunteerStatus,
    deleteVolunteer,
    getAllContacts,
    updateContactStatus,
    deleteContact,
    getAllUsers,
    getAllFundRequests,
    updateFundRequestStatus,
    getAllDonations,
    getDonationsByNgo
} from "../controllers/admin.controller.js";

const router = express.Router();

// Admin login (no auth required)
router.post("/login", adminLogin);

// All other routes require auth + admin role
router.use(verifyToken, verifyAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// NGO management
router.get("/ngos", getAllNgos);
router.put("/ngos/:id/status", updateNgoStatus);
router.delete("/ngos/:id", deleteNgo);

// Volunteer management
router.get("/volunteers", getAllVolunteers);
router.put("/volunteers/:id/status", updateVolunteerStatus);
router.delete("/volunteers/:id", deleteVolunteer);

// Contact management
router.get("/contacts", getAllContacts);
router.put("/contacts/:id/status", updateContactStatus);
router.delete("/contacts/:id", deleteContact);

// User management
router.get("/users", getAllUsers);

// Fund request management
router.get("/funds", getAllFundRequests);
router.put("/funds/:id/status", updateFundRequestStatus);

// Donation management
router.get("/donations", getAllDonations);
router.get("/donations/by-ngo", getDonationsByNgo);

export default router;
