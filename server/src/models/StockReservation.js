import mongoose from "mongoose";

/**
 * Temporary stock hold during checkout.
 * TTL index auto-deletes expired reservations; a background job restores stock.
 */
const stockReservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["held", "converted", "expired", "released"],
      default: "held",
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

stockReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const StockReservation = mongoose.model("StockReservation", stockReservationSchema);
export default StockReservation;
