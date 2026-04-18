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
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    required: false,
    default: null
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

// ✅ Added indexes
paymentSchema.index({ user: 1, status: 1 });          // user's donation history filtered by status
paymentSchema.index({ status: 1, createdAt: -1 });    // admin dashboard: recent paid/failed payments
paymentSchema.index({ createdAt: -1 });               // public stats: recent donations feed

export default mongoose.model("Payment", paymentSchema);
