import mongoose from "mongoose";

const eventNotificationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notificationType: {
      type: String,
      enum: ["EVENT_CANCELLED", "VENUE_SHIFTED", "TIME_SHIFTED", "CUSTOM"],
      required: [true, "Notification type is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    details: {
      oldVenue: String,
      newVenue: String,
      oldTime: String,
      newTime: String,
      reason: String,
    },
    sentTo: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for queries
eventNotificationSchema.index({ eventId: 1, createdAt: -1 });
eventNotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("EventNotification", eventNotificationSchema);
