import express from "express";
import { sendPhoneOtp, verifyPhoneOtp } from "../controllers/otp.controller.js";

const router = express.Router();

router.post("/send-phone",   sendPhoneOtp);
router.post("/verify-phone", verifyPhoneOtp);

export default router;
