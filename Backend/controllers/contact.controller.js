import Contact from "../models/contact.model.js";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { sendAdminReplyEmail } from "../services/mail.service.js";

const toBool = (value) => value === true || value === "true" || value === "on";

export const createContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message, privacy, privacyAccepted } = req.body;

  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanSubject = String(subject || "").trim();
  const cleanMessage = String(message || "").trim();
  const isPrivacyAccepted = toBool(privacyAccepted ?? privacy);

  if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isPrivacyAccepted) {
    throw new ApiError(400, "You must agree to the privacy policy");
  }

  const contact = await Contact.create({
    name: cleanName,
    email: cleanEmail,
    subject: cleanSubject,
    message: cleanMessage,
    privacyAccepted: true
  });

  return res.status(201).json({
    success: true,
    message: "Message saved successfully. We will reach out to you in 24-48 hours.",
    contactId: contact._id,
    contact: {
      id: contact._id,
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      createdAt: contact.createdAt
    }
  });
});

export const getContacts = asyncHandler(async (_, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 }).limit(100).lean();

  return res.status(200).json({
    success: true,
    count: contacts.length,
    contacts
  });
});

export const updateContactStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ["New", "In Progress", "Resolved", "Spam"];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Valid statuses: ${validStatuses.join(", ")}`);
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid contact ID");
  }

  const contact = await Contact.findByIdAndUpdate(id, { status }, { new: true });

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  return res.status(200).json({
    success: true,
    message: `Contact status updated to "${status}"`,
    contact: { id: contact._id, status: contact.status }
  });
});

export const deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid contact ID");
  }

  const contact = await Contact.findByIdAndDelete(id);

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  return res.status(200).json({
    success: true,
    message: "Contact deleted successfully"
  });
});

export const getContactById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid contact ID");
  }

  const contact = await Contact.findById(id).lean();

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  return res.status(200).json({
    success: true,
    contact
  });
});

export const replyToContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { replyMessage, adminName } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid contact ID");
  }

  if (!replyMessage || replyMessage.trim().length < 10) {
    throw new ApiError(400, "Reply message must be at least 10 characters");
  }

  const contact = await Contact.findById(id);

  if (!contact) {
    throw new ApiError(404, "Contact not found");
  }

  await sendAdminReplyEmail({
    name: contact.name,
    email: contact.email,
    originalSubject: contact.subject,
    originalMessage: contact.message,
    adminReply: replyMessage.trim(),
    adminName: adminName || "SevaIndia Support Team"
  });

  contact.status = "Resolved";
  await contact.save();

  return res.status(200).json({
    success: true,
    message: `Reply sent successfully to ${contact.email}`,
    contact: {
      id: contact._id,
      name: contact.name,
      email: contact.email,
      status: contact.status
    }
  });
});
