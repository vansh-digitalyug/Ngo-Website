import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Payment from "../models/payment.model.js";
import razorpay from "../config/razorpay.config.js";
import { createActivity } from "./activity.controller.js";
import "../config/loadEnv.js";

const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

/* =========================
   CREATE ORDER
========================= */
export const createOrder = asyncHandler(async (req, res) => {
  const {
    amount,
    currency = "INR",
    receipt,
    notes,
    ngoId,
    program,
    serviceTitle,
    donorName,
    isAnonymous
  } = req.body || {};

  if (!amount || Number(amount) <= 0) {
    throw new ApiError(400, "Invalid amount");
  }

  const options = {
    amount: amount * 100, // rupees → paise
    currency,
    receipt: receipt || `rcpt_${Date.now()}`,
    notes: notes || {}
  };

  const order = await razorpay.orders.create(options);

  const payment = await Payment.create({
    user: req.user?._id || null,
    ngoId: ngoId || null,
    program: program || null,
    serviceTitle: serviceTitle || "",
    donorName: donorName || notes?.donorName || "",
    isAnonymous: isAnonymous || false,
    amount: Number(amount),
    currency,
    receipt: options.receipt,
    notes: options.notes,
    razorpayOrderId: order.id,
    status: "created"
  });

  console.log('✓ Order created successfully:', {
    paymentId: payment._id,
    orderId: order.id,
    amount: amount,
    userId: req.user?._id || 'anonymous',
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Order created", { order, payment }));
});

/* =========================
   VERIFY PAYMENT
========================= */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id) {
    throw new ApiError(400, "Missing payment fields");
  }

  const expectedSignature = crypto
    .createHmac("sha256", KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { status: "failed" }
    );

    throw new ApiError(400, "Invalid payment signature");
  }

  // Build update object
  const updateData = {
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    status: "paid",
  };

  // If user is not set but user is authenticated, assign user during verification
  const existingPayment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  
  if (existingPayment && !existingPayment.user && req.user?._id) {
    console.log('✓ Assigning user to payment during verification:', {
      paymentId: existingPayment._id,
      userId: req.user._id,
    });
    updateData.user = req.user._id;
  }

  const updatedPayment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    updateData,
    { new: true }
  );

  // Log donation activity if user is authenticated
  if (updatedPayment.user) {
    try {
      const activityTitle = updatedPayment.serviceTitle 
        ? `Donated to ${updatedPayment.serviceTitle}`
        : `Donated ${updatedPayment.currency} ${updatedPayment.amount}`;
      
      await createActivity(
        updatedPayment.user,
        'donation',
        activityTitle,
        `Successfully completed donation of ${updatedPayment.currency} ${updatedPayment.amount}`,
        updatedPayment.amount,
        {
          type: 'donation',
          id: updatedPayment._id,
          paymentId: updatedPayment.razorpayPaymentId,
        },
        {
          paymentId: updatedPayment._id,
          razorpayPaymentId: updatedPayment.razorpayPaymentId,
          amount: updatedPayment.amount,
          ngoId: updatedPayment.ngoId,
        }
      );
      console.log('✓ Donation activity logged:', {
        userId: updatedPayment.user,
        amount: updatedPayment.amount,
      });
    } catch (activityError) {
      console.error('Error logging donation activity:', activityError);
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Payment verified", updatedPayment));
});

/* =========================
   WEBHOOK (PRODUCTION)
========================= */
export const webhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const body = req.body;

  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    throw new ApiError(400, "Invalid webhook signature");
  }

  const event = JSON.parse(body.toString());

  // Example: payment captured
  if (event.event === "payment.captured") {
    const paymentId = event.payload.payment.entity.id;

    await Payment.findOneAndUpdate(
      { razorpayPaymentId: paymentId },
      { status: "paid" }
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Webhook received"));
});

/* =========================
   PAYMENT HISTORY
========================= */
export const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({
    user: req.userId,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Payments fetched", payments));
});