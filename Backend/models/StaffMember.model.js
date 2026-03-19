import mongoose from "mongoose";

const { Schema } = mongoose;

const staffMemberSchema = new Schema(
    {
        ngoId: { type: Schema.Types.ObjectId, ref: "Ngo", required: true, index: true },
        villageId: { type: Schema.Types.ObjectId, ref: "VillageAdoption", default: null },

        name: { type: String, required: true, trim: true },
        role: {
            type: String,
            enum: ["doctor", "teacher", "nurse", "social_worker", "engineer", "lawyer", "paramedic", "counselor", "other"],
            default: "other",
        },
        specialization: { type: String, trim: true, default: "" },
        phone: { type: String, trim: true, default: "" },
        email: { type: String, trim: true, lowercase: true, default: "" },
        bio: { type: String, trim: true, default: "" },

        employmentType: {
            type: String,
            enum: ["full_time", "part_time", "volunteer", "contractual"],
            default: "volunteer",
        },

        isActive: { type: Boolean, default: true, index: true },
        joinedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

staffMemberSchema.index({ ngoId: 1, role: 1 });
staffMemberSchema.index({ ngoId: 1, isActive: 1 });

export default mongoose.model("StaffMember", staffMemberSchema);
