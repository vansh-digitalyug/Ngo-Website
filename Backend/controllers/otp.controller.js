import bcrypt from "bcryptjs";
import { sendSms } from "../services/sms.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/Apiresponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// In-memory OTP store: phone → { otpHash, expiresAt, lastSentAt, attempts }
const phoneOtpStore = new Map();

const OTP_EXPIRY_MS      = 10 * 60 * 1000;  // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;        // 60 seconds
const MAX_ATTEMPTS       = 5;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// POST /api/otp/send-phone   { phone }
export const sendPhoneOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone || !/^\d{10}$/.test(phone)) {
    throw new ApiError(400, "Enter a valid 10-digit phone number");
  }

  const now     = Date.now();
  const existing = phoneOtpStore.get(phone);

  // Resend cooldown
  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    throw new ApiError(429, `Please wait ${waitSec}s before requesting another OTP`);
  }

  const otp     = generateOtp();
  const otpHash = await bcrypt.hash(otp, 8);

  phoneOtpStore.set(phone, {
    otpHash,
    expiresAt:  now + OTP_EXPIRY_MS,
    lastSentAt: now,
    attempts:   0,
  });

  await sendSms(phone, otp);

  res.status(200).json(new ApiResponse(200, "OTP sent successfully"));
});

// POST /api/otp/verify-phone   { phone, otp }
export const verifyPhoneOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    throw new ApiError(400, "Phone and OTP are required");
  }

  const record = phoneOtpStore.get(phone);

  if (!record) {
    throw new ApiError(400, "No OTP requested for this number. Please send OTP first.");
  }

  if (Date.now() > record.expiresAt) {
    phoneOtpStore.delete(phone);
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    phoneOtpStore.delete(phone);
    throw new ApiError(429, "Too many wrong attempts. Please request a new OTP.");
  }

  const isMatch = await bcrypt.compare(otp, record.otpHash);

  if (!isMatch) {
    record.attempts += 1;
    const remaining = MAX_ATTEMPTS - record.attempts;
    throw new ApiError(400, `Incorrect OTP. ${remaining} attempt(s) remaining.`);
  }

  // Verified — clear from store
  phoneOtpStore.delete(phone);

  res.status(200).json(new ApiResponse(200, "Phone number verified successfully"));
});
