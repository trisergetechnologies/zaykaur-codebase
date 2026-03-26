import mongoose from "mongoose";

/**
 * Tax rules: code, rate, applicability. Products reference by taxCode.
 * See docs/database/collections/tax.md
 */
const taxRuleSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    rate: { type: Number, required: true }, // percentage e.g. 12
    type: {
      type: String,
      enum: ["gst", "vat", "igst", "other"],
      required: true,
    },
    region: { type: String, default: null }, // state/country code; null = everywhere
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    effectiveFrom: { type: Date, default: null },
    effectiveTo: { type: Date, default: null },
    priority: { type: Number, default: 0 }, // higher = preferred when multiple match
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

const TaxRule = mongoose.model("TaxRule", taxRuleSchema);
export default TaxRule;
