import mongoose from "mongoose";

/**
 * Idempotency keys for payment and delivery webhooks. Avoid duplicate updates.
 * See docs/database/data-integrity.md
 */
const idempotencyKeySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// TTL: expire after 24 hours (86400 seconds)
idempotencyKeySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const IdempotencyKey = mongoose.model("IdempotencyKey", idempotencyKeySchema);
export default IdempotencyKey;
