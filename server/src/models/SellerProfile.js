import mongoose from "mongoose";

/**
 * Seller profile: one per seller user.
 * See docs/database/collections/users.md
 */
const businessAddressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false }
);

const bankDetailsSchema = new mongoose.Schema(
  {
    accountNumber: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    bankName: { type: String, default: "" },
  },
  { _id: false }
);

const sellerDocumentSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      enum: [
        "gstin",
        "pan",
        "aadhaar",
        "passbook",
        "bank_statement",
        "owner_photo",
        "address",
        "other",
      ],
      required: true,
    },
    documentNumber: { type: String, default: "" },
    documentUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const sellerApprovalEventSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["submitted", "approved", "rejected", "activated", "deactivated"],
      required: true,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const sellerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    shopName: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    ownerPhotoUrl: { type: String, default: "" },
    gstin: { type: String, default: "" },
    pan: { type: String, default: "" },
    aadhaar: { type: String, default: "" },
    businessAddress: businessAddressSchema,
    bankDetails: bankDetailsSchema,
    bankAccountDetails: { type: String, default: "" }, // encrypted or ref; display last4 only
    documents: { type: [sellerDocumentSchema], default: [] },
    onboardingStatus: {
      type: String,
      enum: ["draft", "pending_approval", "approved", "rejected"],
      default: "draft",
      index: true,
    },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewNote: { type: String, default: "" },
    approvalHistory: { type: [sellerApprovalEventSchema], default: [] },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    commissionRate: { type: Number, default: 0 },
    autoAcceptOrder: { type: Boolean, default: false },
    defaultDeliveryProvider: { type: String, default: "" }, // code or ref
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const SellerProfile = mongoose.model("SellerProfile", sellerProfileSchema);
export default SellerProfile;
