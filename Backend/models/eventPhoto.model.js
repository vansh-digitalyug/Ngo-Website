import mongoose from "mongoose";

const eventPhotoSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    S3Imagekey: {
        type: String,
        required: true,
    },
    caption: {
        type: String,
        default: "",
        trim: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    timestamps: true,
});

eventPhotoSchema.index({ eventId: 1, createdAt: -1 });

const EventPhoto = mongoose.model("EventPhoto", eventPhotoSchema);
export default EventPhoto;
