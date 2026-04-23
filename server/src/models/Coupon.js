import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, default: "" },
    type: {
      type: String,
      enum: ["percent", "flat"],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: null },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    usedBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 1 },
      },
    ],
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    applicableCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ],
    applicableSellers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    isActive: { type: Boolean, default: true, index: true },
    /** When true, coupon may appear in GET /coupon/checkout-offers (subject to audience). */
    showOnCheckout: { type: Boolean, default: false, index: true },
    /** all = any logged-in user; new_users = no prior orders OR account created within last 30 days. */
    audience: {
      type: String,
      enum: ["all", "new_users"],
      default: "all",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validTo: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
