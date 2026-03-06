import crypto from "crypto";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Payment from "../models/payment.model.js";
import razorpay from "../config/razorpay.config.js";
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
    user: req.userId || null,
    ngoId: ngoId || null,
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

  const updatedPayment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "paid",
    },
    { new: true }
  );

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