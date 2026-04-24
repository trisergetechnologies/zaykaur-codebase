import mongoose from "mongoose";
import Product from "../models/Product.js";

/**
 * Returns active, non-deleted products in the same order as `ids` (skips missing/inactive).
 * @param {unknown[]} ids
 * @returns {Promise<import("mongoose").LeanDocument<any>[]>}
 */
export async function fetchActiveProductsByIdsOrdered(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return [];

  const orderedKeys = [];
  for (const id of ids) {
    const s = id != null ? String(id).trim() : "";
    if (!mongoose.Types.ObjectId.isValid(s)) continue;
    orderedKeys.push(s);
  }
  if (orderedKeys.length === 0) return [];

  const unique = [...new Set(orderedKeys)];
  const oidList = unique.map((s) => new mongoose.Types.ObjectId(s));

  const docs = await Product.find({
    _id: { $in: oidList },
    status: "active",
    isDeleted: { $ne: true },
  })
    .populate("category", "name slug")
    .populate("categories", "name slug")
    .lean();

  const byId = new Map(docs.map((d) => [String(d._id), d]));
  const out = [];
  for (const key of orderedKeys) {
    const doc = byId.get(key);
    if (doc) out.push(doc);
  }
  return out;
}
