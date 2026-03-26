import mongoose from "mongoose";

/**
 * Category tree: parent + materialized path (ancestors), level, displayOrder.
 * See docs/database/collections/categories.md
 */
const categorySchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    ancestors: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ],
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    displayOrder: { type: Number, default: 0, index: true },
    level: { type: Number, default: 0, index: true }, // 0 = root
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    /** Suggested variant attributes for products in this category. Sellers can use when creating products. */
    variantAttributeTemplates: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        suggestedOptions: [{ type: String }],
        displayOrder: { type: Number, default: 0 },
      },
    ],
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Compound for listing: active, by level, by displayOrder
categorySchema.index({ isActive: 1, level: 1, displayOrder: 1 });
categorySchema.index({ ancestors: 1 });

const Category = mongoose.model("Category", categorySchema);
export default Category;
