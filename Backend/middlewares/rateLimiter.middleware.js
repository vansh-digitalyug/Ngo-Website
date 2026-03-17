import rateLimit from "express-rate-limit";

const json429 = (req, res) => {
    res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
    });
};

// ─── Auth: login + register — 10 attempts per 15 min per IP ──────────────────
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
    skipSuccessfulRequests: true, // only count failures toward the limit
});

// ─── OTP send — 5 sends per 10 min per IP ────────────────────────────────────
export const otpSendLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
});

// ─── Password reset — 5 attempts per 15 min per IP ───────────────────────────
export const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
});

// ─── Public submission endpoints (contact, kanyadan) — 20 per hour per IP ───
export const publicFormLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
});

// ─── General API — 300 req per 15 min per IP (broad protection) ──────────────
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
});
