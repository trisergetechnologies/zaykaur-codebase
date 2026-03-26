import mongoose from "mongoose";

/**
 * Similar products / recommendations (manual or AI). Used for "similar products" and recommendations.
 * See docs/database/collections/recommendations.md
 */
const productRecommendationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    recommendedProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["manual", "ai"],
      required: true,
      index: true,
    },
    score: { type: Number },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productRecommendationSchema.index({ productId: 1, source: 1 });

const ProductRecommendation = mongoose.model(
  "ProductRecommendation",
  productRecommendationSchema
);
export default ProductRecommendation;
