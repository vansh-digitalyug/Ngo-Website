import express from "express";
import multer from "multer";
let router=express.Router();
import {
  sendRegisterOtp,
  registerUser,
  loginUser,
  googleLogin,
  getProfile,
  updateProfile,
  sendEmailVerificationOtp,
  verifyEmailOtp,
  changePassword,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDonations,
  getUserVolunteer,
  getUserKanyadan,
  getUserStats
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import profileUpload from "../middlewares/profileUpload.middleware.js";
import {
    authLimiter,
    otpSendLimiter,
    passwordResetLimiter,
} from "../middlewares/rateLimiter.middleware.js";

const handleProfileUpload = (req, res, next) => {
  profileUpload.single("avatar")(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Profile image size cannot exceed 5MB"
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || "Profile image upload failed"
    });
  });
};

// Send OTP to email before registration (no auth required)
router.post("/send-register-otp", otpSendLimiter, sendRegisterOtp);
// Register a new user (requires OTP verified via /send-register-otp)
router.post("/register", authLimiter, registerUser);
// Login user
router.post("/login", authLimiter, loginUser);
// Google login
router.post("/google-login", authLimiter, googleLogin);
// Forgot password
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
// Reset password
router.post("/reset-password/:token", passwordResetLimiter, resetPassword);
// Get current user profile (protected route)
router.get("/profile", verifyToken, getProfile);
// Get current user stats (protected route)
router.get("/user/stats", verifyToken, getUserStats);
// Update current user profile (protected route)
router.put("/profile", verifyToken, handleProfileUpload, updateProfile);
// Send email verification OTP (protected route)
router.post("/email-verification/send-otp", verifyToken, sendEmailVerificationOtp);
// Verify email OTP (protected route)
router.post("/email-verification/verify-otp", verifyToken, verifyEmailOtp);
// Change password (protected route)
router.post("/change-password", verifyToken, changePassword);
// Logout user (protected route)
router.post("/logout", verifyToken, logoutUser);
// User donation history
router.get("/profile/donations", verifyToken, getUserDonations);
// User volunteer application
router.get("/profile/volunteer", verifyToken, getUserVolunteer);
// User kanyadan applications (matched by phone)
router.get("/profile/kanyadan", verifyToken, getUserKanyadan);

export default router;
