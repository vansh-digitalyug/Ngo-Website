import Task from "../models/task.model.js";
import Payment from "../models/payment.model.js";
import Volunteer from "../models/volunteer.model.js";
import Gallery from "../models/gallery.model.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/Apiresponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getTransporter, getSenderAddress, emailLayout, escapeHtml } from "../config/nodemailer.config.js";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3Client.config.js";

// ─── Sign an S3 URL (1 hour) so private-bucket objects are viewable ───────────
const signMediaUrl = async (url, expiresIn = 3600) => {
  if (!url || !url.includes(".amazonaws.com/")) return url;
  try {
    const key = url.split(".amazonaws.com/")[1];
    const cmd = new GetObjectCommand({ Bucket: process.env.BUCKET_NAME, Key: key });
    return await getSignedUrl(s3, cmd, { expiresIn });
  } catch (_) {
    return url; // fall back to original on error
  }
};

// Sign mediaUrl on a plain task object in-place
const signTaskMedia = async (task) => {
  if (task.mediaUrl) task.mediaUrl = await signMediaUrl(task.mediaUrl);
  return task;
};

// ─── Helper: send task-completion email to donor ─────────────────────────────
const sendDonorCompletionEmail = async ({ donorEmail, donorName, serviceTitle, volunteerName, mediaUrl, mediaType, taskTitle }) => {
  try {
    const transporter = getTransporter();
    const mediaSection = mediaUrl
      ? mediaType === "image"
        ? `<p style="text-align:center;margin:20px 0;">
             <img src="${escapeHtml(mediaUrl)}" alt="Task proof" style="max-width:100%;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.15);" />
           </p>`
        : `<p style="text-align:center;margin:20px 0;">
             <a href="${escapeHtml(mediaUrl)}" style="display:inline-block;padding:10px 20px;background:#2e7d32;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">▶ Watch Video</a>
           </p>`
      : "";

    const bodyHtml = `
      <h2 style="color:#2e7d32;margin:0 0 8px;">Task Completed! 🎉</h2>
      <p style="color:#555;margin:0 0 20px;">Dear <strong>${escapeHtml(donorName || "Donor")}</strong>,</p>
      <p style="color:#555;margin:0 0 16px;">
        Great news! The volunteer <strong>${escapeHtml(volunteerName)}</strong> has completed the work for your donation
        towards <strong>${escapeHtml(serviceTitle)}</strong>.
      </p>
      <div style="background:#f0fdf4;border-left:4px solid #2e7d32;padding:16px;border-radius:6px;margin:0 0 20px;">
        <p style="margin:0;font-weight:600;color:#166534;">Task: ${escapeHtml(taskTitle)}</p>
      </div>
      ${mediaSection}
      <p style="color:#555;margin:0 0 8px;">Your generous donation is making a real difference. Thank you for your support!</p>
      <p style="color:#888;font-size:13px;margin:20px 0 0;">— Team SevaIndia</p>
    `;

    await transporter.sendMail({
      from: getSenderAddress(),
      to: donorEmail,
      subject: `✅ Your donation task "${taskTitle}" has been completed!`,
      html: emailLayout({ title: "Task Completed", bodyHtml }),
    });
  } catch (err) {
    console.error("Failed to send donor completion email:", err.message);
  }
};

// ─── ADMIN: Get all paid donations (for task creation feed) ─────────────────
export const getAdminDonations = asyncHandler(async (req, res) => {
  const page    = Math.max(1, parseInt(req.query.page)  || 1);
  const limit   = Math.min(100, parseInt(req.query.limit) || 20);
  const skip    = (page - 1) * limit;
  const { search, serviceType } = req.query; // serviceType: "general" | "specific"

  const filter = { status: "paid" };

  if (search) {
    filter.$or = [
      { donorName:    { $regex: search, $options: "i" } },
      { serviceTitle: { $regex: search, $options: "i" } },
    ];
  }

  if (serviceType === "general") {
    filter.$and = [
      { $or: [{ serviceTitle: { $in: ["", "General Donation", null] } }, { serviceTitle: { $exists: false } }] },
    ];
  } else if (serviceType === "specific") {
    filter.serviceTitle = { $nin: ["", "General Donation", null] };
  }

  const [donations, total] = await Promise.all([
    Payment.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter),
  ]);

  // Mark donations that already have a task created (include taskId for delete)
  const donationIds = donations.map(d => d._id);
  const existingTasks = await Task.find({ donationId: { $in: donationIds } }).select("donationId status volunteerName").lean();
  const taskedMap = new Map(existingTasks.map(t => [t.donationId.toString(), t]));
  const donationsWithFlag = donations.map(d => {
    const task = taskedMap.get(d._id.toString());
    return task
      ? { ...d, hasTask: true, taskId: task._id.toString(), taskStatus: task.status, taskVolunteer: task.volunteerName }
      : { ...d, hasTask: false };
  });

  res.status(200).json(new ApiResponse(200, "Donations fetched", {
    donations: donationsWithFlag,
    total,
    page,
    pages: Math.ceil(total / limit),
  }));
});

// ─── ADMIN: Get all tasks ────────────────────────────────────────────────────
export const getAdminTasks = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  const signed = await Promise.all(tasks.map(signTaskMedia));
  res.status(200).json(new ApiResponse(200, "Tasks fetched", signed));
});

// ─── ADMIN: Create a task from a donation & assign to volunteer ──────────────
export const createTask = asyncHandler(async (req, res) => {
  const { donationId, volunteerId, title, description, adminNote } = req.body;

  if (!donationId || !volunteerId || !title) {
    throw new ApiError(400, "donationId, volunteerId, and title are required", "VALIDATION_ERROR");
  }

  const [donation, volunteer] = await Promise.all([
    Payment.findById(donationId).populate("user", "name email").lean(),
    Volunteer.findById(volunteerId).lean(),
  ]);

  if (!donation) throw new ApiError(404, "Donation not found", "NOT_FOUND");
  if (donation.status !== "paid") throw new ApiError(400, "Can only create tasks for paid donations", "INVALID_STATUS");
  if (!volunteer) throw new ApiError(404, "Volunteer not found", "NOT_FOUND");
  if (volunteer.status !== "Approved") throw new ApiError(400, "Volunteer must be approved before assignment", "INVALID_STATUS");

  const task = await Task.create({
    donationId,
    donorId:       donation.user?._id || null,
    donorName:     donation.isAnonymous ? "Anonymous" : (donation.donorName || donation.user?.name || ""),
    donorEmail:    donation.user?.email || "",
    donationAmount: donation.amount,
    serviceTitle:  donation.serviceTitle || "",
    volunteerId,
    volunteerName:  volunteer.fullName,
    volunteerEmail: volunteer.email,
    assignedBy:     req.user._id,
    title,
    description:    description || "",
    adminNote:      adminNote   || "",
    status:         "assigned",
  });

  res.status(201).json(new ApiResponse(201, "Task created and assigned to volunteer", task));
});

// ─── ADMIN: Delete a task ────────────────────────────────────────────────────
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new ApiError(404, "Task not found", "NOT_FOUND");
  res.status(200).json(new ApiResponse(200, "Task deleted successfully"));
});

// ─── VOLUNTEER: Get my assigned tasks ───────────────────────────────────────
export const getMyVolunteerTasks = asyncHandler(async (req, res) => {
  // Find the volunteer application for this logged-in user
  const volunteer = await Volunteer.findOne({ user: req.user._id }).lean();
  if (!volunteer) throw new ApiError(404, "Volunteer profile not found", "NOT_FOUND");

  const tasks = await Task.find({ volunteerId: volunteer._id })
    .sort({ createdAt: -1 })
    .lean();

  const signed = await Promise.all(tasks.map(signTaskMedia));
  res.status(200).json(new ApiResponse(200, "Tasks fetched", signed));
});

// ─── VOLUNTEER: Update task status to in_progress ───────────────────────────
export const startTask = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findOne({ user: req.user._id }).lean();
  if (!volunteer) throw new ApiError(404, "Volunteer profile not found", "NOT_FOUND");

  const task = await Task.findOne({ _id: req.params.id, volunteerId: volunteer._id });
  if (!task) throw new ApiError(404, "Task not found", "NOT_FOUND");
  if (task.status !== "assigned") throw new ApiError(400, "Task already started or completed", "INVALID_STATUS");

  task.status = "in_progress";
  await task.save();

  res.status(200).json(new ApiResponse(200, "Task started", task));
});

// ─── VOLUNTEER: Complete task (upload media + close) ────────────────────────
export const completeTask = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findOne({ user: req.user._id }).lean();
  if (!volunteer) throw new ApiError(404, "Volunteer profile not found", "NOT_FOUND");

  const task = await Task.findOne({ _id: req.params.id, volunteerId: volunteer._id });
  if (!task) throw new ApiError(404, "Task not found", "NOT_FOUND");
  if (task.status === "completed") throw new ApiError(400, "Task is already completed", "INVALID_STATUS");

  const { s3Key, mediaType, volunteerNote, addToGallery, galleryTitle, galleryCategory } = req.body;

  if (!s3Key || !mediaType) {
    throw new ApiError(400, "s3Key and mediaType are required to complete a task", "VALIDATION_ERROR");
  }

  // Build full public S3 URL from key
  const mediaUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

  // Update task
  task.mediaUrl      = mediaUrl;
  task.mediaType     = mediaType;
  task.mediaThumbnail = null;
  task.volunteerNote = volunteerNote || "";
  task.status        = "completed";
  task.completedAt   = new Date();

  // Optionally add media to gallery
  if (addToGallery) {
    const galleryItem = await Gallery.create({
      type:            mediaType,
      title:           galleryTitle || task.title,
      description:     `Completed by volunteer ${task.volunteerName} for service: ${task.serviceTitle}`,
      url:             mediaUrl,
      thumbnail:       null,
      category:        galleryCategory || "Volunteer Activities",
      uploadedBy:      req.user._id,
      approvalStatus:  "approved",
      isActive:        true,
      sourceTask:      task._id,
    });
    task.addedToGallery = true;
    task.galleryItemId  = galleryItem._id;
  }

  await task.save();

  // Send email notification to donor (use 7-day signed URL so image is visible in email)
  if (task.donorEmail) {
    const emailMediaUrl = await signMediaUrl(task.mediaUrl, 604800); // 7 days
    await sendDonorCompletionEmail({
      donorEmail:    task.donorEmail,
      donorName:     task.donorName,
      serviceTitle:  task.serviceTitle,
      volunteerName: task.volunteerName,
      mediaUrl:      emailMediaUrl,
      mediaType:     task.mediaType,
      taskTitle:     task.title,
    });
    task.notificationSent = true;
    await task.save();
  }

  res.status(200).json(new ApiResponse(200, "Task completed successfully. Donor has been notified.", task));
});

// ─── DONOR: Get completed tasks for my donations ─────────────────────────────
export const getDonorTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    donorId: req.user._id,
    status:  "completed",
  })
    .sort({ completedAt: -1 })
    .lean();

  const signed = await Promise.all(tasks.map(signTaskMedia));
  res.status(200).json(new ApiResponse(200, "Donor tasks fetched", signed));
});

// ─── ADMIN: Get approved volunteers (for dropdown) ───────────────────────────
export const getApprovedVolunteers = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const filter = { status: "Approved" };
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email:    { $regex: search, $options: "i" } },
    ];
  }

  const volunteers = await Volunteer.find(filter)
    .select("fullName email city state interests role")
    .lean();

  res.status(200).json(new ApiResponse(200, "Approved volunteers fetched", volunteers));
});
