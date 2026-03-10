import express from "express";
import { verifyToken, optionalAuth } from "../middlewares/auth.middleware.js";

import {
  createOrder,
  verifyPayment,
  getPayments,
  webhook,
} from "../controllers/payment.controller.js";

const router = express.Router();

/* =========================
   PAYMENT ROUTES
========================= */

// Create Razorpay Order (optionalAuth links order to user if logged in)
router.post("/order", optionalAuth, createOrder);

// Verify payment after checkout
router.post("/verify", verifyPayment);

// Razorpay webhook (IMPORTANT: raw body)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhook
);

// Get logged-in user payment history
router.get("/history", verifyToken, getPayments);

export default router;