/**
 * Migration: Backfill existing data to match the new DB design.
 * Run once on existing DBs that have the old schema (before variants, category tree, etc.).
 *
 * Usage: node server/scripts/migrate-db-design.js
 * Requires: MONGO_URI in env (e.g. from .env via dotenv).
 *
 * 1. Categories: set parent=null, ancestors=[], level=0, displayOrder if not set.
 * 2. Products: if no variants or empty variants, create one variant from old root-level
 *    price, mrp, stock, sku, images and set category from categories[0] if missing.
 * 3. Orders: rename user -> userId, itemsTotal -> subtotal, taxAmount -> taxTotal,
 *    deliveryCharge -> shippingAmount; ensure items have unitPrice, taxRate, taxAmount,
 *    lineTotal, sellerId (from seller), sku; add discountTotal: 0 if missing.
 * 4. Carts: rename user -> userId, product -> productId, seller -> sellerId; add
 *    variantId (null), addedAt; rename deliveryCharge -> shippingEstimate.
 *
 * See docs/database/data-integrity.md and docs/database/README.md.
 */

import "../src/loadEnv.js";
import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

async function migrate() {
  try {
    await connectDB();
    const db = mongoose.connection.db;
    if (!db) throw new Error("No db connection");

    let categoriesUpdated = 0;
    let productsUpdated = 0;
    let ordersUpdated = 0;
    let cartsUpdated = 0;

    // ----- Categories: backfill parent, ancestors, level, displayOrder -----
    const catColl = db.collection("categories");
    const cats = await catColl.find({}).toArray();
    for (let i = 0; i < cats.length; i++) {
      const c = cats[i];
      const updates = {};
      if (c.parent === undefined) updates.parent = null;
      if (!Array.isArray(c.ancestors)) updates.ancestors = [];
      if (c.level === undefined) updates.level = 0;
      if (c.displayOrder === undefined) updates.displayOrder = i;
      if (Object.keys(updates).length) {
        await catColl.updateOne({ _id: c._id }, { $set: updates });
        categoriesUpdated++;
      }
    }
    console.log(`Categories: ${categoriesUpdated} updated`);

    // ----- Products: backfill variants from old root-level fields -----
    const prodColl = db.collection("products");
    const prods = await prodColl.find({}).toArray();
    const firstCategoryId = cats.length ? cats[0]._id : null;

    for (const p of prods) {
      const variants = p.variants;
      if (Array.isArray(variants) && variants.length > 0) continue; // already has variants

      const variant = {
        _id: new mongoose.Types.ObjectId(),
        sku: p.sku || `LEGACY-${p._id.toString().slice(-8)}`,
        attributes: {},
        price: p.price ?? 0,
        mrp: p.mrp ?? 0,
        stock: p.stock ?? 0,
        images: Array.isArray(p.images) ? p.images : [],
        isActive: p.isActive !== false,
        taxCode: p.taxCode || ""
      };

      const updates = {
        variants: [variant],
        status: p.status || (p.isActive === false ? "draft" : "active"),
        isDeleted: p.isDeleted || false,
        deletedAt: p.deletedAt || null
      };
      if (p.category === undefined && firstCategoryId) updates.category = firstCategoryId;
      if (p.categories === undefined && firstCategoryId) updates.categories = [firstCategoryId];

      await prodColl.updateOne(
        { _id: p._id },
        { $set: updates }
      );
      productsUpdated++;
    }
    console.log(`Products: ${productsUpdated} updated`);

    // ----- Orders: field renames and item shape -----
    const orderColl = db.collection("orders");
    const orders = await orderColl.find({}).toArray();
    for (const o of orders) {
      const updates = {};
      if (o.user !== undefined && o.userId === undefined) updates.userId = o.user;
      if (o.itemsTotal !== undefined && o.subtotal === undefined) updates.subtotal = o.itemsTotal;
      if (o.taxAmount !== undefined && o.taxTotal === undefined) updates.taxTotal = o.taxAmount;
      if (o.deliveryCharge !== undefined && o.shippingAmount === undefined) updates.shippingAmount = o.deliveryCharge;
      if (o.discountTotal === undefined) updates.discountTotal = 0;
      if (o.paymentMethod === undefined) updates.paymentMethod = "cod";
      if (o.paymentId === undefined) updates.paymentId = "";
      if (o.paidAt === undefined) updates.paidAt = null;
      if (o.confirmedAt === undefined) updates.confirmedAt = null;
      if (o.shippedAt === undefined) updates.shippedAt = null;
      if (o.deliveredAt === undefined) updates.deliveredAt = null;
      if (o.shipments === undefined) updates.shipments = [];

      const newItems = (o.items || []).map((it) => {
        const qty = it.quantity || 1;
        const unitPrice = it.unitPrice ?? it.price ?? 0;
        const taxRate = it.taxRate ?? 0;
        const taxAmount = it.taxAmount ?? Math.round(unitPrice * qty * 0.05);
        const lineTotal = it.lineTotal ?? unitPrice * qty + taxAmount;
        return {
          productId: it.productId || it.product,
          variantId: it.variantId || null,
          name: it.name || "",
          sku: it.sku || "",
          quantity: qty,
          unitPrice,
          taxRate,
          taxAmount,
          lineTotal,
          sellerId: it.sellerId || it.seller,
          productSnapshot: it.productSnapshot || { name: it.name, slug: "", image: it.image }
        };
      });
      updates.items = newItems;

      const unset = {};
      if (o.user !== undefined) unset.user = 1;
      if (o.itemsTotal !== undefined) unset.itemsTotal = 1;
      if (o.taxAmount !== undefined) unset.taxAmount = 1;
      if (o.deliveryCharge !== undefined) unset.deliveryCharge = 1;

      if (Object.keys(unset).length) {
        await orderColl.updateOne({ _id: o._id }, { $set: updates, $unset: unset });
      } else {
        await orderColl.updateOne({ _id: o._id }, { $set: updates });
      }
      ordersUpdated++;
    }
    console.log(`Orders: ${ordersUpdated} updated`);

    // ----- Carts: field renames -----
    const cartColl = db.collection("carts");
    const carts = await cartColl.find({}).toArray();
    for (const c of carts) {
      const updates = {};
      if (c.user !== undefined && c.userId === undefined) updates.userId = c.user;
      if (c.deliveryCharge !== undefined && c.shippingEstimate === undefined) updates.shippingEstimate = c.deliveryCharge;
      if (c.taxAmount !== undefined && c.taxTotal === undefined) updates.taxTotal = c.taxAmount;

      const newItems = (c.items || []).map((it) => ({
        productId: it.productId || it.product,
        variantId: it.variantId || null,
        quantity: it.quantity || 1,
        sellerId: it.sellerId || it.seller,
        addedAt: it.addedAt || new Date(),
        unitPrice: it.unitPrice ?? it.price,
        name: it.name,
        image: it.image
      }));
      updates.items = newItems;

      const unset = {};
      if (c.user !== undefined) unset.user = 1;
      if (c.deliveryCharge !== undefined) unset.deliveryCharge = 1;

      await cartColl.updateOne(
        { _id: c._id },
        Object.keys(unset).length ? { $set: updates, $unset: unset } : { $set: updates }
      );
      cartsUpdated++;
    }
    console.log(`Carts: ${cartsUpdated} updated`);

    console.log("✅ Migration completed");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
