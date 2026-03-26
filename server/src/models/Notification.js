import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "order_placed",
        "order_confirmed",
        "order_shipped",
        "order_delivered",
        "order_cancelled",
        "payment_received",
        "payment_failed",
        "seller_approved",
        "seller_rejected",
        "low_stock",
        "review_received",
        "coupon_available",
        "return_update",
        "general",
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    link: { type: String, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
