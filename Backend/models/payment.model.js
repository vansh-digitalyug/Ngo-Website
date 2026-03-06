import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ngo",
    default: null,
    index: true
  },
  serviceTitle: {
    type: String,
    trim: true,
    default: ""
  },
  donorName: {
    type: String,
    trim: true,
    default: ""
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  receipt: {
    type: String
  },
  notes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  razorpayOrderId: {
    type: String,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    index: true
  },
  razorpaySignature: {
    type: String
  },
  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created"
  }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
