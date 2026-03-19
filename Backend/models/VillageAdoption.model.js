import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: "" },
        achievedAt: { type: Date, default: Date.now },
        imageKey: { type: String, default: null }, // S3 key
    },
    { _id: true }
);

const basicNeedSchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ["not_started", "in_progress", "completed"],
            default: "not_started",
        },
        coveragePercent: { type: Number, min: 0, max: 100, default: 0 },
    },
    { _id: false }
);

const villageAdoptionSchema = new mongoose.Schema(
    {
        ngoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ngo",
            required: [true, "NGO ID is required"],
        },

        // ─── Identity ──────────────────────────────────────────────────────────
        villageName: {
            type: String,
            required: [true, "Village name is required"],
            trim: true,
            maxlength: [120, "Village name cannot exceed 120 characters"],
        },
        district: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: {
            type: String,
            trim: true,
            default: "",
            validate: {
                validator: (v) => v === "" || /^\d{6}$/.test(v),
                message: "Pincode must be 6 digits",
            },
        },

        // ─── GPS (optional) ────────────────────────────────────────────────────
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: undefined,
            },
        },

        // ─── Status & dates ────────────────────────────────────────────────────
        status: {
            type: String,
            enum: ["active", "completed", "paused"],
            default: "active",
        },
        adoptedAt: { type: Date, default: Date.now },

        // ─── Details ───────────────────────────────────────────────────────────
        totalFamilies: { type: Number, min: 0, default: 0 },
        description: { type: String, trim: true, maxlength: [2000, "Description too long"], default: "" },
        coverImageKey: { type: String, default: null },

        // ─── Milestones ────────────────────────────────────────────────────────
        milestones: { type: [milestoneSchema], default: [] },

        // ─── Basic needs ───────────────────────────────────────────────────────
        basicNeeds: {
            water:       { type: basicNeedSchema, default: () => ({}) },
            electricity: { type: basicNeedSchema, default: () => ({}) },
            sanitation:  { type: basicNeedSchema, default: () => ({}) },
            roads:       { type: basicNeedSchema, default: () => ({}) },
        },
    },
    { timestamps: true }
);

// ─── Indexes ───────────────────────────────────────────────────────────────────
villageAdoptionSchema.index({ ngoId: 1, status: 1 });
villageAdoptionSchema.index({ state: 1, district: 1 });
villageAdoptionSchema.index({ location: "2dsphere" }, { sparse: true });
villageAdoptionSchema.index(
    { villageName: "text", district: "text", state: "text" },
    { name: "village_text_idx" }
);

const VillageAdoption = mongoose.model("VillageAdoption", villageAdoptionSchema);
export default VillageAdoption;
