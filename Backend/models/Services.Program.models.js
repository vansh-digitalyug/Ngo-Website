import mongoose from "mongoose";

const programSchema = new mongoose.Schema({
    // ── Identity ─────────────────────────────────────────────────────────────
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    categoryName: {
        type: String,
        trim: true,
        default: "",
    },

    // ── Title ────────────────────────────────────────────────────────────────
    title: {
        type: String,
        required: true,
        trim: true,
    },

    // ── Descriptions ─────────────────────────────────────────────────────────
    description: {          // short card description
        type: String,
        trim: true,
        default: "",
    },
    fullDescription: {      // long text shown in modal / detail view
        type: String,
        trim: true,
        default: "",
    },

    // ── Images ───────────────────────────────────────────────────────────────
    imagekeys: {            // S3 key (or URL) of the primary cover image
        type: String,
        default: null,
    },
    galleryImageKeys: {     // S3 keys (or URLs) for the optional carousel (up to ~5)
        type: [String],
        default: [],
    },

    // ── Donation / CTA ───────────────────────────────────────────────────────
    donationTitle: {        // headline shown on the donation widget
        type: String,
        trim: true,
        default: "",
    },
    cta: {                  // button label, e.g. "Help Now"
        type: String,
        trim: true,
        default: "Help Now",
    },
    href: {                 // deep-link route e.g. "/services/orphanage/education" (null if none)
        type: String,
        default: null,
    },

    // ── Status ───────────────────────────────────────────────────────────────
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

// Unique per category, fast lookups by category
programSchema.index({ title: 1, categoryId: 1 }, { unique: true });
programSchema.index({ categoryId: 1 });

const Program = mongoose.model("Program", programSchema);

export default Program;
