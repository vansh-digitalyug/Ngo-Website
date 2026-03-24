import mongoose from "mongoose";

const { Schema } = mongoose;

const metricSchema = new Schema(
    {
        label:    { type: String, required: true, trim: true },
        value:    { type: Number, required: true },
        unit:     { type: String, trim: true, default: "" }, // "people", "villages", "%", "₹", etc.
        category: { type: String, enum: ["beneficiaries","health","education","employment","infrastructure","environment","other"], default: "other" },
        change:   { type: Number, default: 0 },  // % change from previous period
        changeType: { type: String, enum: ["increase","decrease","neutral"], default: "neutral" },
    },
    { _id: true }
);

const impactReportSchema = new Schema(
    {
        ngoId:     { type: Schema.Types.ObjectId, ref: "Ngo", default: null, index: true },
        villageId: { type: Schema.Types.ObjectId, ref: "VillageAdoption", default: null },

        title:       { type: String, required: true, trim: true },
        reportPeriod:{ type: String, enum: ["monthly","quarterly","annual","custom"], default: "monthly" },
        periodStart: { type: Date, required: true },
        periodEnd:   { type: Date, required: true },

        summary:    { type: String, trim: true, default: "" },
        metrics:    { type: [metricSchema], default: [] },
        highlights: [{ type: String, trim: true }],  // key achievements
        challenges: [{ type: String, trim: true }],  // challenges faced
        nextSteps:  [{ type: String, trim: true }],  // planned actions

        status:   { type: String, enum: ["draft","published"], default: "draft", index: true },
        isPublic: { type: Boolean, default: false },
    },
    { timestamps: true }
);

impactReportSchema.index({ ngoId: 1, status: 1 });
impactReportSchema.index({ ngoId: 1, periodStart: -1 });

export default mongoose.model("ImpactReport", impactReportSchema);
