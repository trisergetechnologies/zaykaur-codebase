/**
 * Ensures all required compound indexes exist for optimal query performance.
 * Run: node scripts/ensure-indexes.js
 */
import "../src/loadEnv.js";
import mongoose from "mongoose";

async function ensureIndexes() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;

  const indexDefs = [
    {
      collection: "orders",
      indexes: [
        { key: { userId: 1, createdAt: -1 }, name: "userId_createdAt" },
        { key: { "items.sellerId": 1, createdAt: -1 }, name: "sellerId_createdAt" },
        { key: { orderStatus: 1, createdAt: -1 }, name: "status_createdAt" },
        { key: { paymentStatus: 1, createdAt: -1 }, name: "payment_createdAt" },
        { key: { orderNumber: 1 }, name: "orderNumber", unique: true },
      ],
    },
    {
      collection: "products",
      indexes: [
        { key: { seller: 1, status: 1, isDeleted: 1 }, name: "seller_status_deleted" },
        { key: { category: 1, status: 1, isDeleted: 1 }, name: "category_status_deleted" },
        { key: { status: 1, isDeleted: 1, createdAt: -1 }, name: "active_products_latest" },
        { key: { slug: 1 }, name: "slug", unique: true },
        { key: { "variants.price": 1 }, name: "variant_price" },
        { key: { "variants.stock": 1 }, name: "variant_stock" },
      ],
    },
    {
      collection: "users",
      indexes: [
        { key: { email: 1 }, name: "email", unique: true },
        { key: { role: 1, isDeleted: 1 }, name: "role_deleted" },
        { key: { createdAt: -1 }, name: "created_latest" },
      ],
    },
    {
      collection: "reviews",
      indexes: [
        { key: { productId: 1, isApproved: 1, isDeleted: 1, createdAt: -1 }, name: "product_reviews" },
        { key: { productId: 1, userId: 1 }, name: "product_user", unique: true },
      ],
    },
    {
      collection: "coupons",
      indexes: [
        { key: { code: 1, isActive: 1 }, name: "code_active" },
        { key: { validFrom: 1, validTo: 1, isActive: 1 }, name: "validity_active" },
      ],
    },
    {
      collection: "notifications",
      indexes: [
        { key: { userId: 1, isRead: 1, createdAt: -1 }, name: "user_unread_latest" },
      ],
    },
    {
      collection: "returnrequests",
      indexes: [
        { key: { userId: 1, createdAt: -1 }, name: "user_returns" },
        { key: { sellerId: 1, status: 1, createdAt: -1 }, name: "seller_returns" },
        { key: { status: 1, createdAt: -1 }, name: "status_returns" },
      ],
    },
    {
      collection: "carts",
      indexes: [
        { key: { userId: 1 }, name: "userId", unique: true },
      ],
    },
  ];

  for (const def of indexDefs) {
    const collection = db.collection(def.collection);
    for (const idx of def.indexes) {
      try {
        await collection.createIndex(idx.key, {
          name: idx.name,
          unique: idx.unique || false,
          background: true,
        });
        console.log(`  [${def.collection}] Index "${idx.name}" ensured`);
      } catch (err) {
        console.warn(`  [${def.collection}] Index "${idx.name}" skipped: ${err.message}`);
      }
    }
  }

  console.log("\nAll indexes ensured.");
  await mongoose.disconnect();
}

ensureIndexes().catch((err) => {
  console.error(err);
  process.exit(1);
});
