import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    startTime: {
        type: String,
        default: "",
    },
    endTime: {
        type: String,
        default: "",
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    S3Imagekey: {
        type: String,
        default: "",
    },
    category: {
        type: String,
        default: "General",
        trim: true,
    },
    status: {
        type: String,
        enum: ["upcoming", "ongoing", "past", "cancelled"],
        default: "upcoming",
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    maxParticipants: {
        type: Number,
        default: null,
    },
    // Who created this event
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdByRole: {
        type: String,
        enum: ["admin", "ngo", "volunteer"],
        required: true,
    },
    // If created by an NGO, link it
    ngoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ngo",
        default: null,
    },
}, {
    timestamps: true,
});

eventSchema.index({ date: 1, isPublished: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ ngoId: 1 });

const Event = mongoose.model("Event", eventSchema);
export default Event;
