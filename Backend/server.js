import "./config/loadEnv.js";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";

// ─── Route imports (static — no dynamic import() at startup) ────────────────
import authRoutes from "./routes/auth.routes.js";
import volunteerRoutes from "./routes/volunteer.route.js";
import ngoRoutes from "./routes/ngo.route.js";
import ngoDashboardRoutes from "./routes/ngoDashboard.route.js";
import contactRoutes from "./routes/contact.route.js";
import kycRoutes from "./routes/kyc.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import s3Routes from "./routes/s3.routes.js";
import kanyadanRoutes from "./routes/kanyadanApplication.routes.js";
import taskRoutes from "./routes/task.routes.js";
import publicRoutes from "./routes/public.route.js";
import servicesRoutes from "./routes/services.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import eventRoutes from "./routes/event.routes.js";

import connectDB from "./config/db.js";
import seedAdmin from "./utils/seedAdmin.js";
import logger from "./config/logger.js";
import { globalLimiter } from "./middlewares/rateLimiter.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet({
    // Allow S3/CDN images in the browser
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// ─── Compression (gzip) — reduces JSON response size by ~70% ─────────────────
app.use(compression());

// ─── HTTP request logging ─────────────────────────────────────────────────────
app.use(morgan(
    process.env.NODE_ENV === "production" ? "combined" : "dev",
    { stream: { write: (msg) => logger.http(msg.trim()) } }
));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));

// ─── Body parsers ─────────────────────────────────────────────────────────────
// NOTE: webhook route uses raw body — must be registered BEFORE express.json()
app.use("/api/payment/webhook",
    express.raw({ type: "application/json" })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// ─── Static files ─────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    maxAge: "7d",
    etag: true,
}));

// ─── Global rate limiter (300 req / 15 min per IP) ────────────────────────────
app.use("/api", globalLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api", authRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/ngo-dashboard", ngoDashboardRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/s3", s3Routes);
app.use("/api/kanyadan", kanyadanRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/events", eventRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Global error handler ─────────────────────────────────────────────────────
export const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;

    if (statusCode >= 500) {
        logger.error(`[${req.method}] ${req.path} → ${err.message}`, { stack: err.stack });
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message: err.message || "Internal Server Error",
        error: err.error || null,
    });
};

app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await seedAdmin();

        const server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
        });

        // ─── Graceful shutdown ─────────────────────────────────────────────────
        // Without this, SIGTERM (from PM2, Docker, Kubernetes) kills in-flight
        // requests immediately. Graceful shutdown waits for them to finish.
        const shutdown = (signal) => {
            logger.info(`${signal} received — shutting down gracefully`);
            server.close(async () => {
                try {
                    const mongoose = (await import("mongoose")).default;
                    await mongoose.connection.close();
                    logger.info("MongoDB connection closed");
                } catch (_) { /* ignore */ }
                process.exit(0);
            });

            // Force-exit if shutdown takes more than 10 seconds
            setTimeout(() => {
                logger.error("Graceful shutdown timed out — forcing exit");
                process.exit(1);
            }, 10_000);
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT",  () => shutdown("SIGINT"));

        // Catch unhandled promise rejections — log and keep running
        process.on("unhandledRejection", (reason) => {
            logger.error("Unhandled rejection:", reason);
        });

    } catch (error) {
        logger.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
