import HomepageContent from "../models/HomepageContent.js";
import { getDefaultHomepageContent } from "../lib/homepageDefaults.js";
import { mergeHomepageForPublic } from "../lib/homepagePublicMerge.js";

function toPublicPayload(doc) {
  if (!doc) return getDefaultHomepageContent();
  const o = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  return {
    heroSlides: o.heroSlides ?? [],
    topCategoryStrip: o.topCategoryStrip ?? [],
    bestDeals: o.bestDeals ?? {},
    trendingFashion: o.trendingFashion ?? {},
    updatedAt: o.updatedAt ?? null,
  };
}

export const getPublicHomepage = async (req, res) => {
  try {
    const doc = await HomepageContent.findOne({ key: "main" }).lean();
    if (!doc) {
      return res.json({
        success: true,
        message: "Homepage content",
        data: getDefaultHomepageContent(),
      });
    }
    const raw = toPublicPayload(doc);
    return res.json({
      success: true,
      message: "Homepage content",
      data: mergeHomepageForPublic(raw),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load homepage content",
      data: null,
    });
  }
};

export const getAdminHomepage = async (req, res) => {
  try {
    const doc = await HomepageContent.findOne({ key: "main" }).lean();
    if (!doc) {
      return res.json({
        success: true,
        message: "Using defaults (not saved yet)",
        data: getDefaultHomepageContent(),
      });
    }
    return res.json({
      success: true,
      message: "Homepage content",
      data: toPublicPayload(doc),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load homepage content",
      data: null,
    });
  }
};

export const putAdminHomepage = async (req, res) => {
  try {
    const body = req.body;
    const doc = await HomepageContent.findOneAndUpdate(
      { key: "main" },
      {
        $set: {
          key: "main",
          heroSlides: body.heroSlides,
          topCategoryStrip: body.topCategoryStrip,
          bestDeals: body.bestDeals,
          trendingFashion: body.trendingFashion,
          updatedBy: req.user?._id,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );
    return res.json({
      success: true,
      message: "Homepage content saved",
      data: toPublicPayload(doc),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to save homepage content",
      data: null,
    });
  }
};
