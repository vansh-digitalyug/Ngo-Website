import mongoose, { Schema } from "mongoose";

const employmentApplicationSchema = new Schema(
  {
    employmentId: {
      type: Schema.Types.ObjectId,
      ref: "Employment",
      required: true,
      index: true,
    },
    ngoId: {
      type: Schema.Types.ObjectId,
      ref: "Ngo",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* applicant details */
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, trim: true, lowercase: true },
    phone:       { type: String, required: true, trim: true },
    age:         { type: Number, default: null },
    education:   {
      type: String,
      enum: ["below_10th", "10th", "12th", "graduate", "postgraduate", "other"],
      default: "other",
    },
    experience:  { type: String, trim: true, default: "" },
    message:     { type: String, trim: true, default: "" },

    /* NGO management */
    status: {
      type: String,
      enum: ["pending", "reviewing", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    ngoNote: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

employmentApplicationSchema.index({ ngoId: 1, status: 1 });
employmentApplicationSchema.index({ employmentId: 1, email: 1 }, { unique: true });

export default mongoose.model("EmploymentApplication", employmentApplicationSchema);
