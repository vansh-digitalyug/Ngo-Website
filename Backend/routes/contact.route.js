import express from "express";
import { 
  createContact, 
  getContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  replyToContact
} from "../controllers/contact.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { publicFormLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

// Public routes
router.post("/", publicFormLimiter, createContact);

// Protected admin routes
router.get("/all", authenticate, getContacts);
router.get("/:id", authenticate, getContactById);
router.put("/:id/status", authenticate, updateContactStatus);
router.post("/:id/reply", authenticate, replyToContact);
router.delete("/:id", authenticate, deleteContact);

export default router;
