import mongoose from "mongoose";

// ─── GeoJSON Point (GPS location) ─────────────────────────────────────────────
const locationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: [true, "GPS coordinates are required"],
            validate: {
                validator: (v) => v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90,
                message: "Coordinates must be [longitude, latitude] with valid ranges",
            },
        },
    },
    { _id: false }
);

const communitySchema = new mongoose.Schema(
    {
        // ─── Identity ──────────────────────────────────────────────────────────
        name: {
            type: String,
            required: [true, "Community name is required"],
            trim: true,
            maxlength: [100, "Name cannot exceed 100 characters"],
        },
        areaType: {
            type: String,
            enum: ["mohalla", "gao", "ward", "colony", "village", "town", "other"],
            required: [true, "Area type is required"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, "Description cannot exceed 1000 characters"],
            default: "",
        },

        // ─── Address ───────────────────────────────────────────────────────────
        address: { type: String, trim: true, default: "" },
        pincode: {
            type: String,
            trim: true,
            default: "",
            validate: {
                validator: (v) => v === "" || /^\d{6}$/.test(v),
                message: "Pincode must be a 6-digit number",
            },
        },
        city: { type: String, trim: true, required: [true, "City is required"] },
        district: { type: String, trim: true, required: [true, "District is required"] },
        state: { type: String, trim: true, required: [true, "State is required"] },

        // ─── GPS Location (GeoJSON Point — mandatory for geo queries) ──────────
        location: {
            type: locationSchema,
            required: [true, "GPS location is required"],
        },

        // ─── Optional metadata ─────────────────────────────────────────────────
        population: { type: Number, min: 0, default: null },
        coverImageKey: { type: String, default: null }, // S3 object key
        tags: [{ type: String, trim: true, lowercase: true }],

        // ─── Lifecycle status ──────────────────────────────────────────────────
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },
        adminNote: { type: String, default: null },
        rejectedAt: { type: Date, default: null },

        // ─── Ownership ─────────────────────────────────────────────────────────
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        createdByNgoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ngo",
            default: null,
        },

        // ─── Current leader (denormalized for fast lookup) ─────────────────────
        currentLeaderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        currentLeaderName: { type: String, default: null },

        // ─── Denormalized stats (updated on CommunityActivity/Responsibility changes) ─
        stats: {
            totalResponsibilities: { type: Number, default: 0 },
            activeResponsibilities: { type: Number, default: 0 },
            totalActivities: { type: Number, default: 0 },
            completedActivities: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
// Geospatial — required for $near / $geoWithin / $geoIntersects queries
communitySchema.index({ location: "2dsphere" });

// Full-text search with weighted fields
communitySchema.index(
    { name: "text", description: "text", city: "text", district: "text", tags: "text" },
    { weights: { name: 10, city: 5, district: 3, description: 1, tags: 2 }, name: "community_text_idx" }
);

// Filter/sort indexes
communitySchema.index({ state: 1, district: 1, city: 1 });
communitySchema.index({ areaType: 1, verificationStatus: 1, status: 1 });
communitySchema.index({ createdBy: 1 });
communitySchema.index({ verificationStatus: 1, createdAt: -1 });

const Community = mongoose.model("Community", communitySchema);
export default Community;
