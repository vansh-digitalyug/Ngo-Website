import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(mongoUri, {
        // Connection pool — how many simultaneous DB connections
        // Default is 5, which is fine for small projects.
        // Raise to 20 under moderate traffic, 50+ for high traffic.
        maxPoolSize: Number(process.env.MONGO_POOL_SIZE || 10),

        // How long to wait for a connection from the pool before failing
        serverSelectionTimeoutMS: 5000,

        // How long a socket can be idle before being closed
        socketTimeoutMS: 45000,

        // Keep TCP connections alive (prevents cloud firewall drops)
        family: 4,
    });

    logger.info("MongoDB connected");

    mongoose.connection.on("disconnected", () => {
        logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
        logger.info("MongoDB reconnected");
    });

    mongoose.connection.on("error", (err) => {
        logger.error("MongoDB connection error:", err.message);
    });
};

export default connectDB;
