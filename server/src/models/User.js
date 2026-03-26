import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

/**
 * Embedded address (same shape as order snapshot).
 * See docs/database/collections/users.md
 */
const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "India" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "seller", "admin", "staff"],
      default: "customer",
      index: true,
    },
    avatar: { type: String, default: "" },
    wishlist: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    addresses: [addressSchema],
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null, select: false },
    emailVerificationExpires: { type: Date, default: null, select: false },
    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
    refreshTokens: { type: [String], default: [], select: false },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    lastLoginAt: Date,
    passwordChangedAt: Date,
    googleId: { type: String, default: null, sparse: true },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  return token;
};

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.incrementLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000;
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = null;
  } else {
    this.loginAttempts = (this.loginAttempts || 0) + 1;
    if (this.loginAttempts >= MAX_ATTEMPTS) {
      this.lockUntil = new Date(Date.now() + LOCK_TIME);
    }
  }
  await this.save();
};

const User = mongoose.model("User", userSchema);
export default User;
