import mongoose from "mongoose";

/**
 * Wishlist: separate collection for scale and analytics.
 * See docs/database/collections/cart-wishlist.md
 */
const wishlistSchema = new mongoose.Schema(
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
      index: true,
    },
    variantId: { type: mongoose.Schema.Types.ObjectId },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

wishlistSchema.index({ userId: 1, productId: 1, variantId: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
