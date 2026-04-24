import HomepageContent from "../models/HomepageContent.js";
import { getDefaultHomepageContent } from "../lib/homepageDefaults.js";
import { mergeHomepageForPublic } from "../lib/homepagePublicMerge.js";
import { fetchActiveProductsByIdsOrdered } from "../lib/fetchActiveProductsByIdsOrdered.js";

const CURATED_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function firstVariantImage(p) {
  const v0 = p?.variants?.[0];
  if (!v0?.images?.length) return "";
  const im = v0.images[0];
  if (typeof im === "string") return im.trim();
  if (im && typeof im.url === "string") return im.url.trim();
  return "";
}

async function enrichTrendingFashionTiles(tf) {
  if (!tf?.tiles?.length) return tf;
  const tiles = await Promise.all(
    tf.tiles.map(async (tile) => {
      const ids = Array.isArray(tile.productIds) ? tile.productIds : [];
      if (ids.length === 0) {
        return { ...tile, previewProducts: [] };
      }
      const prods = await fetchActiveProductsByIdsOrdered(ids.slice(0, 8));
      const previewProducts = prods.map((p) => ({
        _id: String(p._id),
        name: p.name || "",
        slug: p.slug || "",
        image: firstVariantImage(p),
      }));
      return { ...tile, previewProducts };
    })
  );
  return { ...tf, tiles };
}

function toPublicPayload(doc) {
  if (!doc) return getDefaultHomepageContent();
  const o = typeof doc.toObject === "function" ? doc.toObject() : { ...doc };
  return {
    featuredProductIds: o.featuredProductIds ?? [],
    heroSlides: o.heroSlides ?? [],
    topCategoryStrip: o.topCategoryStrip ?? [],
    bestDeals: o.bestDeals ?? {},
    trendingFashion: o.trendingFashion ?? {},
    updatedAt: o.updatedAt ?? null,
  };
}

function normalizeTilesForPersist(tiles) {
  if (!Array.isArray(tiles)) return [];
  return tiles.map((t) => ({
    ...t,
    curatedSlug: (t.curatedSlug || "").trim().toLowerCase(),
    landingTitle: t.landingTitle != null ? String(t.landingTitle) : "",
    landingSubtitle: t.landingSubtitle != null ? String(t.landingSubtitle) : "",
    productIds: Array.isArray(t.productIds) ? t.productIds : [],
  }));
}

export const getPublicHomepage = async (req, res) => {
  try {
    const doc = await HomepageContent.findOne({ key: "main" }).lean();
    if (!doc) {
      const defaults = getDefaultHomepageContent();
      const merged = mergeHomepageForPublic(defaults);
      const { featuredProductIds, ...rest } = merged;
      const trendingFashion = await enrichTrendingFashionTiles(rest.trendingFashion);
      return res.json({
        success: true,
        message: "Homepage content",
        data: { ...rest, trendingFashion, featuredProducts: [] },
      });
    }
    const raw = toPublicPayload(doc);
    const merged = mergeHomepageForPublic(raw);
    const { featuredProductIds, ...rest } = merged;

    let featuredProducts = [];
    if (Array.isArray(featuredProductIds) && featuredProductIds.length > 0) {
      featuredProducts = await fetchActiveProductsByIdsOrdered(featuredProductIds);
    }

    const trendingFashion = await enrichTrendingFashionTiles(rest.trendingFashion);

    return res.json({
      success: true,
      message: "Homepage content",
      data: { ...rest, trendingFashion, featuredProducts },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load homepage content",
      data: null,
    });
  }
};

export const getPublicHomepageCurated = async (req, res) => {
  try {
    const slug = (req.params.slug || "").trim().toLowerCase();
    if (!slug || !CURATED_SLUG_REGEX.test(slug)) {
      return res.status(404).json({
        success: false,
        message: "Collection not found",
        data: null,
      });
    }

    const doc = await HomepageContent.findOne({ key: "main" }).lean();
    const raw = doc ? toPublicPayload(doc) : getDefaultHomepageContent();
    const merged = mergeHomepageForPublic(raw);

    let tile = null;
    for (const t of merged.bestDeals?.tiles || []) {
      if ((t.curatedSlug || "").trim().toLowerCase() === slug) {
        tile = t;
        break;
      }
    }
    if (!tile) {
      for (const t of merged.trendingFashion?.tiles || []) {
        if ((t.curatedSlug || "").trim().toLowerCase() === slug) {
          tile = t;
          break;
        }
      }
    }

    const ids = tile?.productIds;
    if (!tile || !Array.isArray(ids) || ids.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Collection not found",
        data: null,
      });
    }

    const products = await fetchActiveProductsByIdsOrdered(ids);
    const title = (tile.landingTitle || "").trim() || tile.title || "";
    const subtitle =
      (tile.landingSubtitle || "").trim() ||
      (tile.subtitle != null ? String(tile.subtitle).trim() : "") ||
      "";
    const heroImage = tile.image || "";

    return res.json({
      success: true,
      message: "Curated collection",
      data: { slug, title, subtitle, heroImage, products },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load collection",
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
    const bestDealsTiles = normalizeTilesForPersist(body.bestDeals?.tiles);
    const trendingTiles = normalizeTilesForPersist(body.trendingFashion?.tiles);

    const doc = await HomepageContent.findOneAndUpdate(
      { key: "main" },
      {
        $set: {
          key: "main",
          featuredProductIds: body.featuredProductIds ?? [],
          heroSlides: body.heroSlides,
          topCategoryStrip: body.topCategoryStrip,
          bestDeals: {
            ...body.bestDeals,
            tiles: bestDealsTiles,
          },
          trendingFashion: {
            ...body.trendingFashion,
            tiles: trendingTiles,
          },
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
