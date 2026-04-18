import mongoose from "mongoose";

const eventReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    reminderType: {
      type: String,
      enum: ["email", "sms", "in-app"],
      default: "email",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    reminderTimes: {
      type: [Number],
      default: [24, 1],
      // Values are hours before event
    },
    notificationsSent: {
      type: [
        {
          hours: Number,
          sentAt: Date,
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Unique index - one reminder per user per event
eventReminderSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model("EventReminder", eventReminderSchema);
