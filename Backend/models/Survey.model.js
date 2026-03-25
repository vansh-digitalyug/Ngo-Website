import mongoose from "mongoose";
import crypto from "crypto";

const { Schema } = mongoose;

const questionSchema = new Schema(
    {
        type: { type: String, enum: ["text", "multiple_choice", "rating", "yes_no", "scale"], required: true },
        question: { type: String, required: true, trim: true },
        required: { type: Boolean, default: false },
        options: [{ type: String, trim: true }], // for multiple_choice
        scaleMin: { type: Number, default: 1 },  // for scale
        scaleMax: { type: Number, default: 10 }, // for scale
    },
    { _id: true }
);

const surveySchema = new Schema(
    {
        ngoId:    { type: Schema.Types.ObjectId, ref: "Ngo", required: true, index: true },
        villageId: { type: Schema.Types.ObjectId, ref: "VillageAdoption", default: null },

        title:       { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: "" },
        status:      { type: String, enum: ["draft", "active", "closed"], default: "draft", index: true },
        questions:   { type: [questionSchema], default: [] },
        targetAudience: { type: String, trim: true, default: "" },
        startDate: { type: Date, default: null },
        endDate:   { type: Date, default: null },
        shareToken: {
            type: String,
            unique: true,
            default: () => crypto.randomBytes(16).toString("hex"),
            index: true,
        },
        responseCount: { type: Number, default: 0 },
        isPublic: { type: Boolean, default: true },
        coverImageKey: { type: String, default: "" },
    },
    { timestamps: true }
);

surveySchema.index({ ngoId: 1, status: 1 });

export default mongoose.model("Survey", surveySchema);
