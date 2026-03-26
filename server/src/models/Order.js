import mongoose from "mongoose";

/**
 * Order address snapshot (no ref to user address).
 * See docs/database/collections/orders.md
 */
const addressSnapshotSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false }
);

/**
 * Order line item: full snapshot at order time (immutable after create).
 */
const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    variantId: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
    taxCode: { type: String, default: "" },
    taxType: { type: String, default: "unknown" },
    taxRate: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, required: true, default: 0 },
    lineTotal: { type: Number, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productSnapshot: {
      name: String,
      slug: String,
      image: String,
    },
  },
  { _id: false }
);

/**
 * Shipment: one per seller or partial dispatch. Third-party or manual.
 * See docs/database/collections/order-tracking-delivery.md
 */
const shipmentEventSchema = new mongoose.Schema(
  {
    at: { type: Date, required: true },
    status: String,
    location: String,
    description: String,
  },
  { _id: false }
);

const shipmentSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [{ type: Number }], // order item indices
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "packed",
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "returned",
        "cancelled",
      ],
      default: "placed",
    },
    carrierCode: { type: String, required: true }, // e.g. BLUEDART, DELHIVERY, MANUAL
    carrierName: String,
    awbNumber: String,
    trackingUrl: String,
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryProvider" },
    dispatchedAt: Date,
    deliveredAt: Date,
    events: [shipmentEventSchema],
  },
  { _id: true, timestamps: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderNumber: { type: String, required: true, unique: true, index: true },
    shippingAddress: { type: addressSnapshotSchema, required: true },
    billingAddress: addressSnapshotSchema,
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    taxTotal: { type: Number, required: true },
    shippingAmount: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentMethod: {
      type: String,
      enum: ["cod", "online", "wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    paymentId: String,
    razorpayOrderId: { type: String, default: null, index: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    paidAt: Date,
    orderStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "packed",
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "returned",
        "cancelled",
      ],
      default: "placed",
      index: true,
    },
    shipments: [shipmentSchema],
    confirmedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    returnedAt: Date,
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: 1 });
orderSchema.index({ "items.sellerId": 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
