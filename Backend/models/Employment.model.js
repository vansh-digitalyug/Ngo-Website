import mongoose from "mongoose";

const { Schema } = mongoose;

const employmentSchema = new Schema(
    {
        ngoId: { type: Schema.Types.ObjectId, ref: "Ngo", required: true, index: true },
        villageId: { type: Schema.Types.ObjectId, ref: "VillageAdoption", default: null },

        title: { type: String, required: true, trim: true },
        category: {
            type: String,
            enum: ["skill_training", "job_placement", "self_employment", "apprenticeship", "other"],
            default: "skill_training",
        },
        description: { type: String, trim: true, default: "" },
        skills: [{ type: String, trim: true }],
        location: { type: String, trim: true, default: "" },

        openings: { type: Number, default: 1, min: 0 },
        filled: { type: Number, default: 0, min: 0 },

        status: {
            type: String,
            enum: ["open", "closed", "completed"],
            default: "open",
            index: true,
        },

        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        stipend: { type: Number, default: 0 }, // monthly INR, 0 = unpaid/voluntary

        isPublic: { type: Boolean, default: true },
    },
    { timestamps: true }
);

employmentSchema.index({ ngoId: 1, status: 1 });
employmentSchema.index({ category: 1, status: 1 });

export default mongoose.model("Employment", employmentSchema);
