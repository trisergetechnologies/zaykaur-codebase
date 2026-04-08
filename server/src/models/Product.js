import mongoose from "mongoose";

/**
 * Embedded variant: SKU, attributes, price, mrp, stock, images.
 * See docs/database/collections/products.md
 */
const variantImageSchema = new mongoose.Schema(
  { url: String, alt: String },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. { size: "M", color: "Red" }
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: {
      type: [variantImageSchema],
      validate: {
        validator: (images) => Array.isArray(images) && images.length > 0 && images.length <= 5,
        message: "Each variant must have between 1 and 5 images",
      },
    },
    isActive: { type: Boolean, default: true },
    taxCode: { type: String, default: "" }, // override product-level tax if needed
  },
  { _id: true, timestamps: false }
);

/**
 * Product with embedded variants. Primary category + optional categories.
 * See docs/database/collections/products.md
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: { type: String, required: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    categories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ],
    brand: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "active", "out_of_stock", "discontinued"],
      default: "draft",
      index: true,
    },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} }, // e.g. fabric, material
    taxCode: { type: String, default: "" }, // code from tax_rules
    /** Defines variant selectors (RAM, Storage, Size, Color) and their options. Backend derives variantSelectors from this for frontend. */
    variantAttributeDefs: [
      {
        key: { type: String, required: true }, // e.g. "ram", "size", "color"
        label: { type: String, required: true }, // e.g. "RAM", "Size", "Color"
        options: [{ type: String }],
        displayOrder: { type: Number, default: 0 },
      },
    ],
    variants: {
      type: [variantSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "At least one variant is required",
      },
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Optional: text search
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
