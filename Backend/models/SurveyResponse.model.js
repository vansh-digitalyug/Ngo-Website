import mongoose from "mongoose";

const { Schema } = mongoose;

const answerSchema = new Schema(
    {
        questionId: { type: Schema.Types.ObjectId, required: true },
        answer: { type: Schema.Types.Mixed }, // string | number | string[]
    },
    { _id: false }
);

const surveyResponseSchema = new Schema(
    {
        surveyId:       { type: Schema.Types.ObjectId, ref: "Survey", required: true, index: true },
        ngoId:          { type: Schema.Types.ObjectId, ref: "Ngo", required: true },
        villageId:      { type: Schema.Types.ObjectId, ref: "VillageAdoption", default: null },
        respondentName: { type: String, trim: true, default: "Anonymous" },
        respondentPhone:{ type: String, trim: true, default: "" },
        answers:        { type: [answerSchema], default: [] },
        submittedBy:    { type: Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

surveyResponseSchema.index({ surveyId: 1, createdAt: -1 });

export default mongoose.model("SurveyResponse", surveyResponseSchema);
