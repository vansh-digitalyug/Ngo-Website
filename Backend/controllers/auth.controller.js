import User from "../models/user.model.js";
import Ngo from "../models/ngo.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import {
    sendResetPasswordEmail,
    sendEmailVerificationOtpEmail,
    sendWelcomeEmail,
    sendLoginNotificationEmail
} from "../services/mail.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// ── In-memory OTP store for pre-registration email verification ───────────────
// Structure: email -> { otpHash, name, expiresAt, lastSentAt }
const pendingRegisterOtps = new Map();
import "../config/loadEnv.js";
import asyncHandler from "../utils/asyncHandler.js";

const DEFAULT_BCRYPT_SALT_ROUNDS = 8;
const BCRYPT_SALT_ROUNDS = (() => {
    const parsedRounds = Number(process.env.BCRYPT_SALT_ROUNDS);
    return Number.isInteger(parsedRounds) && parsedRounds >= 8 && parsedRounds <= 14
        ? parsedRounds
        : DEFAULT_BCRYPT_SALT_ROUNDS;
})();

const GOOGLE_CLIENT_ID = String(process.env.GOOGLE_CLIENT_ID || "").trim();
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return token;
};

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

const toUserPayload = (user, ngoData = null) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
    aadhaarVerified: Boolean(user.aadhaarVerified),
    isVerified: Boolean(user.emailVerified),
    phone: user.phone || "",
    city: user.city || "",
    state: user.state || "",
    avatar: user.avatar || null,
    authProvider: user.authProvider || "local",
    role: user.role || "user",
    createdAt: user.createdAt || null,
    // NGO related fields
    ngoId: user.ngoId || null,
    ngoRole: user.ngoRole || null,
    // Include NGO details if provided
    ngoStatus: ngoData?.isVerified ? "verified" : (ngoData ? "pending" : null),
    ngoName: ngoData?.ngoName || null
});

const hashResetToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

const hashOtp = (otp) =>
    crypto.createHash("sha256").update(String(otp || "")).digest("hex");

const OTP_EXPIRY_MINUTES = Number(process.env.EMAIL_OTP_EXPIRY_MIN || 10);
const OTP_COOLDOWN_SECONDS = Number(process.env.EMAIL_OTP_RESEND_COOLDOWN_SEC || 60);
const OTP_MAX_ATTEMPTS = Number(process.env.EMAIL_OTP_MAX_ATTEMPTS || 5);

const getOtpExpiryMinutes = () => Math.max(1, OTP_EXPIRY_MINUTES);
const getOtpCooldownSeconds = () => Math.max(15, OTP_COOLDOWN_SECONDS);
const getOtpMaxAttempts = () => Math.max(1, OTP_MAX_ATTEMPTS);

const generateOtpCode = () =>
    String(crypto.randomInt(100000, 1000000));

const buildResetPasswordUrl = (token) => {
    const base =
        process.env.RESET_PASSWORD_URL ||
        `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`;

    const normalizedBase = String(base).trim();

    if (normalizedBase.includes("{token}")) {
        return normalizedBase.replace("{token}", encodeURIComponent(token));
    }

    if (normalizedBase.includes(":token")) {
        return normalizedBase.replace(":token", encodeURIComponent(token));
    }

    const separator = normalizedBase.includes("?") ? "&" : "?";
    return `${normalizedBase}${separator}resetToken=${encodeURIComponent(token)}`;
};

const verifyGoogleIdToken = async (idToken) => {
    if (!googleClient || !GOOGLE_CLIENT_ID) {
        throw new Error("Google sign-in is not configured yet.");
    }

    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
        throw new Error("Invalid Google credential payload.");
    }

    return payload;
};

// Send OTP to email before registration /api/send-register-otp
export const sendRegisterOtp = asyncHandler(async (req, res) => {
    const cleanName = String(req.body?.name || "").trim();
    const cleanEmail = normalizeEmail(req.body?.email);

    if (!cleanName || !cleanEmail) {
        throw new ApiError(400, "Name and email are required");
    }

    // Block if user already exists
    const existingUser = await User.findOne({ email: cleanEmail }).select("_id").lean();
    if (existingUser) {
        throw new ApiError(400, "An account with this email already exists. Please log in.");
    }

    // Cooldown: prevent spam
    const existing = pendingRegisterOtps.get(cleanEmail);
    const cooldown = getOtpCooldownSeconds();
    if (existing?.lastSentAt && Date.now() - existing.lastSentAt < cooldown * 1000) {
        const retryAfter = Math.ceil((cooldown * 1000 - (Date.now() - existing.lastSentAt)) / 1000);
        throw new ApiError(429, `Please wait ${retryAfter}s before requesting a new OTP`);
    }

    const otp = generateOtpCode();
    const otpHash = hashOtp(otp);
    const expiryMinutes = getOtpExpiryMinutes();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Store in memory
    pendingRegisterOtps.set(cleanEmail, {
        otpHash,
        name: cleanName,
        expiresAt,
        lastSentAt: Date.now()
    });

    await sendEmailVerificationOtpEmail({ name: cleanName, email: cleanEmail, otp, expiryMinutes });

    return res.status(200).json(
        new ApiResponse(200, `OTP sent to ${cleanEmail}. It expires in ${expiryMinutes} minutes.`, {
            expiryMinutes,
            resendCooldownSeconds: cooldown
        })
    );
});

// Register a new user /api/register
export const registerUser = asyncHandler(async (req, res) => {
        const { name, email, password, otp } = req.body;
        const cleanName = String(name || "").trim();
        const cleanEmail = normalizeEmail(email);

        // Validation
        if (!cleanName || !cleanEmail || !password) {
            throw new ApiError(400, "All fields are required");
        }

        if (password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters long");
        }

        // Verify registration OTP
        if (!otp) {
            throw new ApiError(400, "Email OTP is required. Please verify your email first.");
        }

        const pending = pendingRegisterOtps.get(cleanEmail);
        if (!pending) {
            throw new ApiError(400, "No OTP found for this email. Please click 'Send OTP' first.");
        }

        if (new Date(pending.expiresAt).getTime() <= Date.now()) {
            pendingRegisterOtps.delete(cleanEmail);
            throw new ApiError(400, "OTP has expired. Please request a new one.");
        }

        if (hashOtp(String(otp).trim()) !== pending.otpHash) {
            throw new ApiError(400, "Invalid OTP. Please check and try again.");
        }

        // OTP is valid — remove from store
        pendingRegisterOtps.delete(cleanEmail);

        // Check user doesn't already exist
        const existingUser = await User.findOne({ email: cleanEmail }).select("_id").lean();
        if (existingUser) {
            throw new ApiError(400, "User already exists. Please log in instead.");
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const newUser = new User({
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
            emailVerified: true  // verified via OTP before registration
        });
        await newUser.save();

        console.log(`New user registered: ${newUser._id}`);

        // Send welcome email (non-blocking)
        setImmediate(() => {
            sendWelcomeEmail({ name: newUser.name, email: newUser.email })
                .catch(err => console.error("[mail] Welcome email failed:", err.message));
        });

        // Generate token and set cookie
        const token = generateToken(res, newUser._id);

        return res.status(201).json(
            new ApiResponse(201, "Account created successfully. Welcome to SevaIndia!", {
                token,
                ...toUserPayload(newUser)
            })
        );
});

// Login user /api/login
export const loginUser = asyncHandler(async (req, res) => {
        const { email, password, loginType } = req.body;
        const cleanEmail = normalizeEmail(email);
        const isNgoLogin = loginType === "ngo";

        if (!cleanEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User does not exist. Please register first."
            });
        }

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // For NGO login, validate NGO association
        let ngoData = null;
        if (isNgoLogin) {
            if (!user.ngoId) {
                // Check if user has an NGO by email (for cases where ngoId wasn't linked)
                const ngoByEmail = await Ngo.findOne({ email: cleanEmail }).select("_id ngoName isVerified");
                if (ngoByEmail) {
                    // Link the NGO to user
                    user.ngoId = ngoByEmail._id;
                    user.ngoRole = "owner";
                    await user.save();
                    ngoData = ngoByEmail;
                } else {
                    return res.status(403).json({
                        success: false,
                        message: "No NGO registered with this account. Please register an NGO first.",
                        code: "NO_NGO_FOUND"
                    });
                }
            } else {
                ngoData = await Ngo.findById(user.ngoId).select("_id ngoName isVerified");
                if (!ngoData) {
                    return res.status(403).json({
                        success: false,
                        message: "NGO not found. It may have been deleted.",
                        code: "NGO_NOT_FOUND"
                    });
                }
            }
        }

        // Generate token and set cookie
        const token = generateToken(res, user._id);

        // Fire login notification email (non-blocking)
        setImmediate(() => {
            const loginTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
            sendLoginNotificationEmail({ name: user.name, email: user.email, loginTime })
                .catch(err => console.error("[mail] Login notification failed:", err.message));
        });

        res.status(200).json({
            success: true,
            message: isNgoLogin ? "NGO login successful" : "User logged in successfully",
            token,
            data: toUserPayload(user, ngoData),
            loginType: isNgoLogin ? "ngo" : "user"
        });
});

// Google login /api/google-login
export const googleLogin = asyncHandler(async (req, res) => {
        if (!googleClient || !GOOGLE_CLIENT_ID) {
            return res.status(503).json({
                success: false,
                message: "Google sign-in is not configured yet."
            });
        }

        const credential = String(req.body?.credential || "").trim();
        if (!credential) {
            return res.status(400).json({
                success: false,
                message: "Google credential is required"
            });
        }

        let googlePayload;
        try {
            googlePayload = await verifyGoogleIdToken(credential);
        } catch (tokenError) {
            return res.status(401).json({
                success: false,
                message: "Invalid Google credential",
                error: tokenError.message
            });
        }

        const googleId = String(googlePayload.sub || "").trim();
        const cleanEmail = normalizeEmail(googlePayload.email);
        const cleanName =
            String(googlePayload.name || "").trim() ||
            (cleanEmail ? cleanEmail.split("@")[0] : "User");
        const avatar =
            typeof googlePayload.picture === "string"
                ? googlePayload.picture.trim()
                : "";
        const googleEmailIsVerified = Boolean(googlePayload.email_verified);

        if (!googleId || !cleanEmail) {
            return res.status(400).json({
                success: false,
                message: "Google account email is unavailable"
            });
        }

        if (!googleEmailIsVerified) {
            return res.status(403).json({
                success: false,
                message: "Google email is not verified"
            });
        }

        let user = await User.findOne({
            $or: [{ googleId }, { email: cleanEmail }]
        });

        if (!user) {
            user = await User.create({
                name: cleanName,
                email: cleanEmail,
                authProvider: "google",
                googleId,
                avatar: avatar || null,
                emailVerified: false
            });
        } else {
            if (user.googleId && user.googleId !== googleId) {
                return res.status(409).json({
                    success: false,
                    message: "This email is linked to a different Google account."
                });
            }

            const updates = {};
            if (!user.googleId) updates.googleId = googleId;
            if (!user.avatar && avatar) updates.avatar = avatar;
            if (!user.name && cleanName) updates.name = cleanName;

            if (Object.keys(updates).length > 0) {
                user = await User.findByIdAndUpdate(
                    user._id,
                    { $set: updates },
                    { new: true }
                );
            }
        }

        const token = generateToken(res, user._id);

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token,
            data: toUserPayload(user)
        });
});

// Forgot password /api/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
        const cleanEmail = normalizeEmail(req.body?.email);
        const genericMessage = "A password reset link has been sent. Please check your email.";

        if (!cleanEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email: cleanEmail }).select("_id name email");

        if (!user) {
            return res.status(200).json({
                success: true,
                message: genericMessage
            });
        }

        const rawResetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = hashResetToken(rawResetToken);
        const expiryMinutes = Number(process.env.RESET_PASSWORD_TOKEN_EXP_MIN || 15);
        const expiresAt = new Date(Date.now() + Math.max(expiryMinutes, 1) * 60 * 1000);

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordTokenHash: resetTokenHash,
                    resetPasswordExpiresAt: expiresAt
                }
            }
        );

        const resetUrl = buildResetPasswordUrl(rawResetToken);
        setImmediate(() => {
            sendResetPasswordEmail({
                name: user.name,
                email: user.email,
                resetUrl,
                expiryMinutes: Math.max(expiryMinutes, 1)
            }).catch(async (mailError) => {
                console.error("forgotPassword mail error:", mailError.message);
                try {
                    await User.updateOne(
                        { _id: user._id, resetPasswordTokenHash: resetTokenHash },
                        { $set: { resetPasswordTokenHash: null, resetPasswordExpiresAt: null } }
                    );
                } catch (rollbackError) {
                    console.error("forgotPassword rollback error:", rollbackError.message);
                }
            });
        });

        return res.status(200).json({
            success: true,
            message: genericMessage
        });
});

// Reset password /api/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
        const token = String(req.params?.token || "").trim();
        const password = String(req.body?.password || "");

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Token and new password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        const resetTokenHash = hashResetToken(token);

        const user = await User.findOne({
            resetPasswordTokenHash: resetTokenHash,
            resetPasswordExpiresAt: { $gt: new Date() }
        }).select("_id name email");

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Reset link is invalid or has expired"
            });
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const updateResult = await User.updateOne(
            { _id: user._id, resetPasswordTokenHash: resetTokenHash },
            {
                $set: {
                    password: hashedPassword,
                    resetPasswordTokenHash: null,
                    resetPasswordExpiresAt: null
                }
            }
        );

        if (!updateResult?.matchedCount) {
            return res.status(400).json({
                success: false,
                message: "Reset link is invalid or has expired"
            });
        }

        const authToken = generateToken(res, user._id);

        return res.status(200).json({
            success: true,
            message: "Password reset successful. You are now logged in.",
            token: authToken,
            data: toUserPayload(user)
        });
});

// Send email verification OTP /api/email-verification/send-otp
export const sendEmailVerificationOtp = asyncHandler(async (req, res) => {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first."
            });
        }

        const user = await User.findById(req.userId)
            .select("_id name email emailVerified emailVerificationOtpLastSentAt");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.emailVerified) {
            return res.status(200).json({
                success: true,
                message: "Your email is already verified",
                data: toUserPayload(user)
            });
        }

        const cooldownSeconds = getOtpCooldownSeconds();
        const now = Date.now();
        const lastSentAt = user.emailVerificationOtpLastSentAt
            ? new Date(user.emailVerificationOtpLastSentAt).getTime()
            : 0;
        const elapsedMs = now - lastSentAt;

        if (lastSentAt && elapsedMs < cooldownSeconds * 1000) {
            const retryAfterSeconds = Math.ceil((cooldownSeconds * 1000 - elapsedMs) / 1000);
            return res.status(429).json({
                success: false,
                message: `Please wait ${retryAfterSeconds}s before requesting a new OTP`,
                retryAfterSeconds
            });
        }

        const otp = generateOtpCode();
        const otpHash = hashOtp(otp);
        const expiryMinutes = getOtpExpiryMinutes();
        const expiresAt = new Date(now + expiryMinutes * 60 * 1000);

        user.emailVerificationOtpHash = otpHash;
        user.emailVerificationOtpExpiresAt = expiresAt;
        user.emailVerificationOtpAttempts = 0;
        user.emailVerificationOtpLastSentAt = new Date(now);
        await user.save();

        try {
            await sendEmailVerificationOtpEmail({
                name: user.name,
                email: user.email,
                otp,
                expiryMinutes
            });
        } catch (mailError) {
            await User.updateOne(
                { _id: user._id, emailVerificationOtpHash: otpHash },
                {
                    $set: {
                        emailVerificationOtpHash: null,
                        emailVerificationOtpExpiresAt: null,
                        emailVerificationOtpAttempts: 0
                    }
                }
            );

            return res.status(500).json({
                success: false,
                message: "Unable to send verification OTP right now",
                error: mailError.message
            });
        }

        return res.status(200).json({
            success: true,
            message: `We sent a 6-digit OTP to ${user.email}`,
            resendCooldownSeconds: cooldownSeconds
        });
});

// Verify email OTP /api/email-verification/verify-otp
export const verifyEmailOtp = asyncHandler(async (req, res) => {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first."
            });
        }

        const otp = String(req.body?.otp || "").trim();
        if (!/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid 6-digit OTP"
            });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.emailVerified) {
            return res.status(200).json({
                success: true,
                message: "Your email is already verified",
                data: toUserPayload(user)
            });
        }

        if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpiresAt) {
            return res.status(400).json({
                success: false,
                message: "No active OTP found. Please request a new OTP."
            });
        }

        if (new Date(user.emailVerificationOtpExpiresAt).getTime() <= Date.now()) {
            user.emailVerificationOtpHash = null;
            user.emailVerificationOtpExpiresAt = null;
            user.emailVerificationOtpAttempts = 0;
            await user.save();

            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new OTP."
            });
        }

        const maxAttempts = getOtpMaxAttempts();
        const currentAttempts = Number(user.emailVerificationOtpAttempts || 0);

        if (currentAttempts >= maxAttempts) {
            user.emailVerificationOtpHash = null;
            user.emailVerificationOtpExpiresAt = null;
            user.emailVerificationOtpAttempts = 0;
            await user.save();

            return res.status(429).json({
                success: false,
                message: "Too many failed OTP attempts. Please request a new OTP."
            });
        }

        const isOtpValid = hashOtp(otp) === user.emailVerificationOtpHash;
        if (!isOtpValid) {
            user.emailVerificationOtpAttempts = currentAttempts + 1;
            await user.save();

            const attemptsLeft = Math.max(maxAttempts - user.emailVerificationOtpAttempts, 0);
            const attemptsMessage = attemptsLeft > 0
                ? `Invalid OTP. ${attemptsLeft} attempt(s) left.`
                : "Invalid OTP. No attempts left, please request a new OTP.";

            return res.status(400).json({
                success: false,
                message: attemptsMessage,
                attemptsLeft
            });
        }

        user.emailVerified = true;
        user.emailVerificationOtpHash = null;
        user.emailVerificationOtpExpiresAt = null;
        user.emailVerificationOtpAttempts = 0;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
            data: toUserPayload(user)
        });
});

// Change current user's password /api/change-password
export const changePassword = asyncHandler(async (req, res) => {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first."
            });
        }

        const currentPassword = String(req.body?.currentPassword || "");
        const newPassword = String(req.body?.newPassword || "");

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters long"
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from current password"
            });
        }

        const user = await User.findById(req.userId).select("_id password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "Password login is not enabled for this account."
            });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    password: hashedNewPassword,
                    resetPasswordTokenHash: null,
                    resetPasswordExpiresAt: null
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
});

// Update current logged-in user profile /api/profile
export const updateProfile = asyncHandler(async (req, res) => {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first."
            });
        }

        const updates = {};

        if (typeof req.body?.name !== "undefined") {
            const cleanName = String(req.body.name || "").trim();
            if (!cleanName) {
                return res.status(400).json({
                    success: false,
                    message: "Name is required"
                });
            }
            updates.name = cleanName;
        }

        if (typeof req.body?.phone !== "undefined") {
            updates.phone = String(req.body.phone || "").trim();
        }

        if (typeof req.body?.address !== "undefined") {
            updates.address = String(req.body.address || "").trim();
        }

        if (typeof req.body?.city !== "undefined") {
            updates.city = String(req.body.city || "").trim();
        }

        if (typeof req.body?.state !== "undefined") {
            updates.state = String(req.body.state || "").trim();
        }

        if (req.file?.buffer && req.file?.mimetype) {
            updates.avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No profile changes provided"
            });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: toUserPayload(user)
        });
});

// Get current logged-in user /api/profile
export const getProfile = asyncHandler(async (req, res) => {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first."
            });
        }

        const user = await User.findById(req.userId)
            .select("_id name email phone address city state avatar authProvider emailVerified createdAt")
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: toUserPayload(user)
        });
});

// Logout user /api/logout
export const logoutUser = asyncHandler(async (req, res) => {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0)
        });

        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
});

// Admin Login /api/admin/login
export const adminLogin = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const cleanEmail = normalizeEmail(email);

        // Log admin login attempt (for security audit)
        console.log(`[ADMIN LOGIN ATTEMPT] ${new Date().toISOString()} - Email: ${cleanEmail} - IP: ${req.ip || req.connection?.remoteAddress || 'unknown'}`);

        if (!cleanEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email: cleanEmail });
        
        if (!user) {
            console.log(`[ADMIN LOGIN FAILED] ${new Date().toISOString()} - Email: ${cleanEmail} - Reason: User not found`);
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Check if user is an admin
        if (user.role !== "admin") {
            console.log(`[ADMIN LOGIN FAILED] ${new Date().toISOString()} - Email: ${cleanEmail} - Reason: Not an admin (role: ${user.role})`);
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        if (!user.password) {
            console.log(`[ADMIN LOGIN FAILED] ${new Date().toISOString()} - Email: ${cleanEmail} - Reason: No password set`);
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`[ADMIN LOGIN FAILED] ${new Date().toISOString()} - Email: ${cleanEmail} - Reason: Invalid password`);
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate token and set cookie
        const token = generateToken(res, user._id);

        console.log(`[ADMIN LOGIN SUCCESS] ${new Date().toISOString()} - Email: ${cleanEmail} - User ID: ${user._id}`);

        res.status(200).json({
            success: true,
            message: "Admin login successful",
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar || null
            }
        });
});
