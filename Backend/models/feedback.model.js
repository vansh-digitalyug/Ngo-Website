import mongoose from "mongoose";

/**
 * Feedback
 * ─────────────────────────────────────────────────────────────────────────────
 * Anyone (logged-in or anonymous) can submit feedback about the platform,
 * an NGO, volunteer, community, event, or service.
 *
 * Status lifecycle: new → read → acknowledged → resolved
 * Admin can reply (visible to user) and add private notes.
 */
const feedbackSchema = new mongoose.Schema(
    {
        // ─── Submitter info ────────────────────────────────────────────────────
        // For logged-in users: userId is set. For anonymous: name/email required.
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },
        phone: {
            type: String,
            trim: true,
            default: null,
        },

        // ─── Feedback category ─────────────────────────────────────────────────
        feedbackType: {
            type: String,
            enum: ["platform", "ngo", "volunteer", "event", "community", "service", "other"],
            required: [true, "Feedback type is required"],
        },

        // ─── Optional target (e.g., specific NGO or community being reviewed) ──
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        targetName: {
            type: String,
            trim: true,
            default: null,
        },
        targetModel: {
            type: String,
            enum: ["Ngo", "Volunteer", "Event", "Community", "Services.Program", null],
            default: null,
        },

        // ─── Feedback content ──────────────────────────────────────────────────
        rating: {
            type: Number,
            min: [1, "Rating must be between 1 and 5"],
            max: [5, "Rating must be between 1 and 5"],
            default: null,
        },
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
            maxlength: [200, "Subject cannot exceed 200 characters"],
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            minlength: [10, "Message must be at least 10 characters"],
            maxlength: [2000, "Message cannot exceed 2000 characters"],
        },

        // ─── Admin management ──────────────────────────────────────────────────
        status: {
            type: String,
            enum: ["new", "read", "acknowledged", "resolved"],
            default: "new",
        },
        adminNote: {
            type: String,
            trim: true,
            default: null, // private — not visible to submitter
        },
        adminReply: {
            type: String,
            trim: true,
            default: null, // visible to submitter
        },
        repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        repliedAt: {
            type: Date,
            default: null,
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
feedbackSchema.index({ status: 1, createdAt: -1 });           // admin sidebar filter
feedbackSchema.index({ feedbackType: 1, status: 1 });          // filter by type
feedbackSchema.index({ userId: 1, createdAt: -1 });            // user's own feedback
feedbackSchema.index({ targetId: 1, feedbackType: 1 });        // feedback on a target entity
feedbackSchema.index({ rating: 1, feedbackType: 1 });          // analytics
feedbackSchema.index({ createdAt: -1 });                       // recent first (admin default)

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
