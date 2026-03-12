import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import {
  getAdminDonations,
  getAdminTasks,
  createTask,
  deleteTask,
  getMyVolunteerTasks,
  startTask,
  completeTask,
  getDonorTasks,
  getApprovedVolunteers,
  taskDetails,
  getTaskById,
  getTaskStats
} from "../controllers/task.controller.js";

const router = express.Router();

// ── All routes require authentication ────────────────────────────────────────
router.use(verifyToken);

// ── Admin routes ─────────────────────────────────────────────────────────────
router.get("/admin/donations",   verifyAdmin, getAdminDonations);    // Paid donations list
router.get("/admin/all",         verifyAdmin, getAdminTasks);         // All tasks
router.get("/admin/volunteers",  verifyAdmin, getApprovedVolunteers); // Approved volunteers for assignment
router.post("/admin/create",     verifyAdmin, createTask);            // Create & assign task
router.delete("/admin/:id",      verifyAdmin, deleteTask);            // Delete task
router.get("/admin/task/:id",   verifyAdmin, getTaskById);          // Get task details for admin

// ── Volunteer routes ──────────────────────────────────────────────────────────
router.get("/volunteer/my-tasks",       getMyVolunteerTasks);  // Get my assigned tasks
router.put("/volunteer/:id/start",      startTask);            // Mark task in_progress
router.put("/volunteer/:id/complete",   completeTask);         // Complete task + upload media
router.get("/volunteer/task/:id",       taskDetails);          // Get task details for volunteer
router.get("/volunteer/task-stats",     getTaskStats);         // Get task stats for volunteer dashboard

// ── Donor routes ──────────────────────────────────────────────────────────────
router.get("/donor/my-tasks", getDonorTasks); // Completed tasks for donor's donations

export default router;
