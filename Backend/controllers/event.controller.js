import Event from "../models/event.model.js";
import EventPhoto from "../models/eventPhoto.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/Apiresponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/events — upcoming published events (public)
export const getAllEvents = asyncHandler(async (_req, res) => {
    const now = new Date();
    const events = await Event.find({
        isPublished: true,
        status: "upcoming",
        date: { $gte: now },
    })
        .sort({ date: 1 })
        .populate("createdBy", "name email")
        .populate("ngoId", "ngoName");
    res.status(200).json(new ApiResponse(200, "Upcoming events retrieved successfully", events));
});

// GET /api/events/:id — single event (public)
export const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id)
        .populate("createdBy", "name email")
        .populate("ngoId", "ngoName");
    if (!event) throw new ApiError(404, "Event not found");
    res.status(200).json(new ApiResponse(200, "Event retrieved successfully", event));
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTHENTICATED (admin / ngo / volunteer)
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/events — create event
export const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, startTime, endTime, location, S3Imagekey, category, maxParticipants } = req.body;

    if (!title || !description || !date || !location) {
        throw new ApiError(400, "Title, description, date, and location are required");
    }

    const role = req.user.role;
    const createdByRole = role === "admin" ? "admin" : req.ngo ? "ngo" : "volunteer";
    const ngoId = req.ngo ? req.ngo._id : (req.user.ngoId || null);

    const event = await Event.create({
        title,
        description,
        date,
        startTime: startTime || "",
        endTime: endTime || "",
        location,
        S3Imagekey: S3Imagekey || "",
        category: category || "General",
        maxParticipants: maxParticipants || null,
        createdBy: req.user._id,
        createdByRole,
        ngoId,
        // Admin events auto-published; others need admin approval
        isPublished: role === "admin",
    });

    res.status(201).json(new ApiResponse(201, "Event created successfully", event));
});

// PUT /api/events/:id — update event (creator or admin)
export const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) throw new ApiError(404, "Event not found");

    const isAdmin = req.user.role === "admin";
    const isCreator = event.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
        throw new ApiError(403, "You can only update your own events");
    }

    const allowed = ["title", "description", "date", "startTime", "endTime", "location", "S3Imagekey", "category", "maxParticipants", "status"];
    const updates = {};
    for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields provided to update");
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.status(200).json(new ApiResponse(200, "Event updated successfully", updated));
});

// DELETE /api/events/:id — delete event (creator or admin)
export const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) throw new ApiError(404, "Event not found");

    const isAdmin = req.user.role === "admin";
    const isCreator = event.createdBy.toString() === req.user._id.toString();

    if (!isAdmin && !isCreator) {
        throw new ApiError(403, "You can only delete your own events");
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json(new ApiResponse(200, "Event deleted successfully", null));
});

// GET /api/events/my-events — events created by the logged-in user / NGO
export const getMyEvents = asyncHandler(async (req, res) => {
    const filter = req.ngo
        ? { ngoId: req.ngo._id }
        : { createdBy: req.user._id };

    const events = await Event.find(filter).sort({ date: 1 });
    res.status(200).json(new ApiResponse(200, "Your events retrieved successfully", events));
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ONLY
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/events/admin/all — all events (including unpublished)
export const adminGetAllEvents = asyncHandler(async (_req, res) => {
    const events = await Event.find()
        .sort({ createdAt: -1 })
        .populate("createdBy", "name email role")
        .populate("ngoId", "ngoName");
    res.status(200).json(new ApiResponse(200, "All events retrieved", events));
});

// PATCH /api/events/admin/:id/publish — publish or unpublish
export const togglePublish = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) throw new ApiError(404, "Event not found");

    event.isPublished = !event.isPublished;
    await event.save();

    const msg = event.isPublished ? "Event published" : "Event unpublished";
    res.status(200).json(new ApiResponse(200, msg, event));
});

// ─────────────────────────────────────────────────────────────────────────────
// PAST EVENT PHOTOS
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/events/:id/photos — upload multiple photos to a past event
// Body: { photos: [{ S3Imagekey, caption }] }
export const addEventPhotos = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) throw new ApiError(404, "Event not found");

    const isAdmin = req.user.role === "admin";
    const isCreator = event.createdBy.toString() === req.user._id.toString();
    const isNgoOwner = req.ngo && event.ngoId && event.ngoId.toString() === req.ngo._id.toString();

    if (!isAdmin && !isCreator && !isNgoOwner) {
        throw new ApiError(403, "You are not allowed to add photos to this event");
    }

    const { photos } = req.body;
    if (!Array.isArray(photos) || photos.length === 0) {
        throw new ApiError(400, "Provide at least one photo with S3Imagekey");
    }

    const docs = photos.map((p) => {
        if (!p.S3Imagekey) throw new ApiError(400, "Each photo must have an S3Imagekey");
        return {
            eventId: event._id,
            S3Imagekey: p.S3Imagekey,
            caption: p.caption || "",
            uploadedBy: req.user._id,
        };
    });

    const saved = await EventPhoto.insertMany(docs);

    // Auto-mark event as completed when photos are uploaded for a past event
    if (event.status !== "completed") {
        await Event.findByIdAndUpdate(event._id, { status: "completed" });
    }

    res.status(201).json(new ApiResponse(201, `${saved.length} photo(s) uploaded successfully`, saved));
});

// GET /api/events/:id/photos — get all photos of an event (public)
export const getEventPhotos = asyncHandler(async (req, res) => {
    const event = await Event.findById(req.params.id);
    if (!event) throw new ApiError(404, "Event not found");

    const photos = await EventPhoto.find({ eventId: req.params.id })
        .sort({ createdAt: -1 })
        .populate("uploadedBy", "name");

    res.status(200).json(new ApiResponse(200, "Event photos retrieved successfully", photos));
});

// DELETE /api/events/:id/photos/:photoId — delete a single photo (creator or admin)
export const deleteEventPhoto = asyncHandler(async (req, res) => {
    const photo = await EventPhoto.findById(req.params.photoId);
    if (!photo) throw new ApiError(404, "Photo not found");

    if (photo.eventId.toString() !== req.params.id) {
        throw new ApiError(400, "Photo does not belong to this event");
    }

    const isAdmin = req.user.role === "admin";
    const isUploader = photo.uploadedBy.toString() === req.user._id.toString();

    if (!isAdmin && !isUploader) {
        throw new ApiError(403, "You can only delete your own photos");
    }

    await EventPhoto.findByIdAndDelete(req.params.photoId);
    res.status(200).json(new ApiResponse(200, "Photo deleted successfully", null));
});
