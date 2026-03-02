// import crypto from "crypto";
// import asyncHandler from "../utils/asyncHandler.js";
// import ApiError from "../utils/ApiError.js";
// import ApiResponse from "../utils/Apiresponse.js";
// import "../config/loadEnv.js";

// const KEY_ID = process.env.RAZORPAY_KEY_ID || "";
// const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
// const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

// async function getRazorpayClient() {
//   try {
//     const mod = await import("razorpay");
//     const Razorpay = mod.default || mod;
//     return new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
//   } catch (err) {
//     return null;
//   }
// }

// // Create an order
// export const createOrder = asyncHandler(async (req, res) => {
//   const { amount, currency = "INR", receipt, notes } = req.body || {};

//   if (!amount || Number(amount) <= 0) {
//     throw new ApiError(400, "Invalid amount provided");
//   }

//   const options = {
//     amount: Math.round(Number(amount)), // amount in paise when INR
//     currency,
//     receipt: receipt || `rcpt_${Date.now()}`,
//     payment_capture: 1,
//     notes: notes || {}
//   };

//   const client = await getRazorpayClient();
//   let order;
//   if (client && client.orders && typeof client.orders.create === "function") {
//     order = await client.orders.create(options);
//   } else {
//     order = { id: `order_mock_${Date.now()}`, ...options };
//   }

//   return res.status(201).json(new ApiResponse(201, "Order created", order));
// });

// // Verify a payment (client will send order_id, payment_id and signature)
// // NOTE: during early development we may not have Razorpay credentials yet.
// //       In that case the environment variable RAZORPAY_KEY_SECRET should be
// //       left empty and the signature check will be skipped, allowing all
// //       payments to be "approved" unconditionally.  Once you obtain your
// //       real keys, set RAZORPAY_KEY_ID/KEY_SECRET in your .env and the code
// //       below will automatically enforce proper HMAC verification.  No further
// //       changes to this file are needed; the conditional is based solely on
// //       whether KEY_SECRET is truthy.
// export const verifyPayment = asyncHandler(async (req, res) => {
//   const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

//   if (!razorpay_order_id || !razorpay_payment_id) {
//     throw new ApiError(400, "Missing razorpay order/payment fields");
//   }

//   // If a secret key exists we perform the normal signature validation.
//   // Otherwise we auto-approve (useful when credentials are not yet available).
//   if (KEY_SECRET) {
//     if (!razorpay_signature) {
//       throw new ApiError(400, "Missing razorpay signature");
//     }

//     const generatedSignature = crypto
//       .createHmac("sha256", KEY_SECRET)
//       .update(razorpay_order_id + "|" + razorpay_payment_id)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       throw new ApiError(400, "Invalid payment signature");
//     }
//   } else {
//     // no secret configured, skip verification (e.g., local development)
//     console.warn("Razorpay secret not configured; skipping signature verification");
//   }

//   // At this point payment is considered verified. You can update DB/order status here.
//   return res.status(200).json(new ApiResponse(200, "Payment verified", {
//     orderId: razorpay_order_id,
//     paymentId: razorpay_payment_id
//   }));
// });

// // Webhook handler (Razorpay will POST events here)
// export const handleWebhook = asyncHandler(async (req, res) => {
//   const signature = req.headers["x-razorpay-signature"] || req.headers["x-razorpay-signature".toLowerCase()];
//   const body = req.rawBody || JSON.stringify(req.body || {});

//   if (!WEBHOOK_SECRET) {
//     throw new ApiError(500, "Webhook secret is not configured on server");
//   }

//   const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");

//   if (!signature || expected !== signature) {
//     // invalid webhook
//     return res.status(400).json(new ApiResponse(400, "Invalid webhook signature"));
//   }

//   const event = req.body;

//   // Handle relevant events as needed
//   // e.g. payment.captured, payment.failed, order.paid, etc.

//   // For now just acknowledge
//   return res.status(200).json(new ApiResponse(200, "Webhook received", { event: event.type || null }));
// });

// export default {
//   createOrder,
//   verifyPayment,
//   handleWebhook
// };
