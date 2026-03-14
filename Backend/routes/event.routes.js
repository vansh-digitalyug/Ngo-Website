import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
import { requireNgoAuth } from "../middlewares/ngoAuth.middleware.js";
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getMyEvents,
    adminGetAllEvents,
    togglePublish,
    addEventPhotos,
    getEventPhotos,
    deleteEventPhoto,
} from "../controllers/event.controller.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────────────────────────────────────────
router.get("/", getAllEvents);
router.get("/:id/photos", getEventPhotos);
router.get("/:id", getEventById);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ONLY
// ─────────────────────────────────────────────────────────────────────────────
router.get("/admin/all", authenticate, verifyAdmin, adminGetAllEvents);
router.patch("/admin/:id/publish", authenticate, verifyAdmin, togglePublish);

// ─────────────────────────────────────────────────────────────────────────────
// NGO DASHBOARD — create/manage NGO events
// ─────────────────────────────────────────────────────────────────────────────
router.get("/ngo/my-events", requireNgoAuth, getMyEvents);
router.post("/ngo/create", requireNgoAuth, createEvent);
router.put("/ngo/:id", requireNgoAuth, updateEvent);
router.delete("/ngo/:id", requireNgoAuth, deleteEvent);

// ─────────────────────────────────────────────────────────────────────────────
// VOLUNTEER / ADMIN — create/manage own events
// ─────────────────────────────────────────────────────────────────────────────
router.get("/my-events", authenticate, getMyEvents);
router.post("/create", authenticate, createEvent);
router.put("/:id", authenticate, updateEvent);
router.delete("/:id", authenticate, deleteEvent);

// ─────────────────────────────────────────────────────────────────────────────
// PAST EVENT PHOTOS (authenticated — admin / ngo / volunteer)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/:id/photos", authenticate, addEventPhotos);
router.delete("/:id/photos/:photoId", authenticate, deleteEventPhoto);

// NGO variant — uses requireNgoAuth so req.ngo is set for ownership check
router.post("/ngo/:id/photos", requireNgoAuth, addEventPhotos);
router.delete("/ngo/:id/photos/:photoId", requireNgoAuth, deleteEventPhoto);

export default router;
