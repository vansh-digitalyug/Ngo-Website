import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { adminLogin } from "../controllers/auth.controller.js";
import {
    getFeedbackStats,
    adminGetAllFeedback,
    adminGetFeedbackById,
    adminUpdateFeedbackStatus,
    adminReplyToFeedback,
    adminDeleteFeedback,
} from "../controllers/feedback.controller.js";
import {
    getReportStats,
    adminGetAllReports,
    adminGetReportById,
    adminUpdateReportStatus,
    adminUpdateReportSeverity,
    adminDeleteReport,
} from "../controllers/report.controller.js";
import {
    getCommunityPlatformStats,
    adminGetAllCommunities,
    adminGetCommunityById,
    adminUpdateCommunityStatus,
    adminAssignLeader,
    adminDeleteCommunity,
    adminGetAllResponsibilities,
    adminUpdateResponsibilityStatus,
    adminGetAllActivities,
    adminVerifyActivity,
    adminDeleteActivity,
} from "../controllers/admin.community.controller.js";
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
import { getProfessionStats } from "../controllers/volunteer.controller.js";

import { createCategory,
    createProgram,
    getAllCategories,
    getProgramsByCategory,
    getAllPrograms,
    getProgramById,
    getProgramByTitle,
    updateProgram,
    deleteProgram,
    deleteCategory
} from "../controllers/services.controller.js";


        
import {
    getAllKanyadanApplications,
    updateKanyadanApplicationStatus,
    deleteKanyadanApplication,
    getKanyadanStats
} from "../controllers/kanyadanApplication.controller.js";

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
// Profession stats (detailed=true adds state-wise breakdown)
router.get("/volunteers/profession-stats", getProfessionStats);

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

// Kanyadan Yojna applications
router.get("/kanyadan", getAllKanyadanApplications);
router.get("/kanyadan/stats", getKanyadanStats);
router.put("/kanyadan/:id/status", updateKanyadanApplicationStatus);
router.delete("/kanyadan/:id", deleteKanyadanApplication);

// Service categories and programs
router.post("/categories", createCategory);
router.post("/programs", createProgram);
router.get("/categories", getAllCategories);
router.get("/categories/:categoryId/programs", getProgramsByCategory);
router.get("/programs", getAllPrograms);
router.get("/programs/:programId", getProgramById);
router.get("/programs/title/:title", getProgramByTitle);
router.put("/programs/:programId", updateProgram);
router.delete("/programs/:programId", deleteProgram);
router.delete("/categories/:categoryId", deleteCategory);

// ─── Feedback management (sidebar) ───────────────────────────────────────────
router.get("/feedback/stats", getFeedbackStats);
router.get("/feedback", adminGetAllFeedback);
router.get("/feedback/:id", adminGetFeedbackById);
router.put("/feedback/:id/status", adminUpdateFeedbackStatus);
router.put("/feedback/:id/reply", adminReplyToFeedback);
router.delete("/feedback/:id", adminDeleteFeedback);

// ─── Report management (sidebar) ─────────────────────────────────────────────
router.get("/reports/stats", getReportStats);
router.get("/reports", adminGetAllReports);
router.get("/reports/:id", adminGetReportById);
router.put("/reports/:id/status", adminUpdateReportStatus);
router.put("/reports/:id/severity", adminUpdateReportSeverity);
router.delete("/reports/:id", adminDeleteReport);

// ─── Community management ─────────────────────────────────────────────────────
router.get("/communities/stats", getCommunityPlatformStats);
router.get("/communities", adminGetAllCommunities);
router.get("/communities/:id", adminGetCommunityById);
router.put("/communities/:id/status", adminUpdateCommunityStatus);
router.put("/communities/:id/assign-leader", adminAssignLeader);
router.delete("/communities/:id", adminDeleteCommunity);

// ─── Community responsibility management ─────────────────────────────────────
router.get("/community-responsibilities", adminGetAllResponsibilities);
router.put("/community-responsibilities/:id/status", adminUpdateResponsibilityStatus);

// ─── Community activity management ───────────────────────────────────────────
router.get("/community-activities", adminGetAllActivities);
router.put("/community-activities/:id/verify", adminVerifyActivity);
router.delete("/community-activities/:id", adminDeleteActivity);






export default router;
