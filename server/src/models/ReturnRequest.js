import mongoose from "mongoose";

const returnRequestSchema = new mongoose.Schema(
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
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        variantId: { type: mongoose.Schema.Types.ObjectId },
        name: String,
        sku: String,
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
      },
    ],
    reason: {
      type: String,
      enum: [
        "defective",
        "wrong_item",
        "not_as_described",
        "damaged_in_transit",
        "size_fit_issue",
        "changed_mind",
        "other",
      ],
      required: true,
    },
    description: { type: String, default: "" },
    images: [{ url: String, alt: String }],
    status: {
      type: String,
      enum: [
        "requested",
        "approved",
        "rejected",
        "pickup_scheduled",
        "picked_up",
        "received",
        "refund_initiated",
        "refund_completed",
        "closed",
      ],
      default: "requested",
      index: true,
    },
    refundAmount: { type: Number, default: 0 },
    refundMethod: {
      type: String,
      enum: ["original_payment", "wallet", "bank_transfer"],
      default: "original_payment",
    },
    sellerNote: { type: String, default: "" },
    adminNote: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

returnRequestSchema.index({ status: 1, createdAt: -1 });

const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);
export default ReturnRequest;
