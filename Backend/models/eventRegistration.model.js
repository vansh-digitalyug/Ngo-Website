import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ngo",
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: {
        validator: (v) =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
        message: "Invalid email address",
      },
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: (v) => /^[\d\s\-\+\(\)]{10,}$/.test(v),
        message: "Phone number must be at least 10 digits",
      },
    },
    registrationType: {
      type: String,
      enum: ["individual", "ngo", "volunteer"],
      default: "individual",
    },
    status: {
      type: String,
      enum: ["registered", "attended", "cancelled", "no-show"],
      default: "registered",
      index: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    attendedAt: {
      type: Date,
    },
    additionalInfo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index to prevent duplicate registrations
eventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

export default mongoose.model("EventRegistration", eventRegistrationSchema);
