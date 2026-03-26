import mongoose from "mongoose";

/**
 * Cart item: productId, variantId (optional), quantity, sellerId. Totals are estimates.
 * See docs/database/collections/cart-wishlist.md
 */
const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: { type: mongoose.Schema.Types.ObjectId },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addedAt: { type: Date, default: Date.now },
    unitPrice: { type: Number, min: 0 },
    name: String,
    image: String,
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    itemsTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    shippingEstimate: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
