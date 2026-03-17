import mongoose from "mongoose";

// OTP records are stored in MongoDB instead of an in-memory Map so that:
//  1. OTPs survive server restarts / PM2 cluster reloads
//  2. Multiple server instances share the same OTP state (horizontal scaling)
//  3. The TTL index auto-cleans expired records — no manual cleanup needed

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        trim: true,
        default: "",
    },
    // MongoDB TTL index deletes the document automatically after expiresAt
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // delete when current time >= expiresAt
    },
    lastSentAt: {
        type: Date,
        default: Date.now,
    },
    attempts: {
        type: Number,
        default: 0,
    },
}, { timestamps: false });

// One pending OTP per email at a time
otpSchema.index({ email: 1 }, { unique: true });

const OtpStore = mongoose.model("OtpStore", otpSchema);

export default OtpStore;
