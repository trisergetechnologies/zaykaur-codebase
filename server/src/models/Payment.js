import mongoose from "mongoose";

/**
 * Payment: tracks Razorpay order/payment lifecycle.
 * One Payment per Order attempt. Supports COD, online (Razorpay), wallet.
 */

const refundSchema = new mongoose.Schema(
  {
    razorpayRefundId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["created", "processed", "failed"],
      default: "created",
    },
    reason: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    method: {
      type: String,
      enum: ["cod", "online", "wallet"],
      required: true,
    },
    provider: {
      type: String,
      enum: ["razorpay", "cod", "wallet"],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    razorpayOrderId: { type: String, default: null, index: true },
    razorpayPaymentId: { type: String, default: null, sparse: true },
    razorpaySignature: { type: String, default: null },

    status: {
      type: String,
      enum: ["created", "authorized", "captured", "failed", "refunded", "partially_refunded"],
      default: "created",
      index: true,
    },

    attempts: { type: Number, default: 0 },
    failureReason: { type: String, default: null },
    capturedAt: { type: Date, default: null },
    refunds: [refundSchema],
    refundedAmount: { type: Number, default: 0 },

    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

paymentSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
