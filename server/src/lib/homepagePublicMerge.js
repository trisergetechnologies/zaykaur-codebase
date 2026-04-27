import { getDefaultHomepageContent } from "./homepageDefaults.js";

const t = (s) => (typeof s === "string" ? s.trim() : s ? String(s).trim() : "");

const MAX_FEATURED = 30;

function normalizeFeaturedProductIds(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const id of raw) {
    const s = id != null ? String(id).trim() : "";
    if (!/^[a-fA-F0-9]{24}$/.test(s)) continue;
    out.push(s);
    if (out.length >= MAX_FEATURED) break;
  }
  return out;
}

function isValidHeroSlides(slides) {
  return (
    Array.isArray(slides) &&
    slides.length > 0 &&
    slides.every(
      (s) =>
        s &&
        Array.isArray(s.images) &&
        s.images.length > 0 &&
        Boolean(t(s.images[0]))
    )
  );
}

function isValidTopCategoryStrip(items) {
  return (
    Array.isArray(items) &&
    items.length > 0 &&
    items.every((c) => c && t(c.name) && t(c.slug) && t(c.image))
  );
}

function isValidBestDealTiles(tiles) {
  return (
    Array.isArray(tiles) &&
    tiles.length > 0 &&
    tiles.every((x) => x && t(x.title) && t(x.image) && t(x.gridClass))
  );
}

function isValidTrendingTiles(tiles) {
  return (
    Array.isArray(tiles) &&
    tiles.length > 0 &&
    tiles.every((x) => x && t(x.title) && t(x.image))
  );
}

function isValidShopByCategoryCards(cards) {
  const categoryFromLink = (link) => {
    const raw = link != null ? String(link) : "";
    const match = raw.match(/[?&]category=([^&]+)/i);
    if (!match?.[1]) return "";
    try {
      return decodeURIComponent(match[1]).trim().toLowerCase();
    } catch {
      return String(match[1]).trim().toLowerCase();
    }
  };
  return (
    Array.isArray(cards) &&
    cards.length > 0 &&
    cards.every((x) => {
      if (!x || !t(x.image)) return false;
      const categorySlug = t(x.categorySlug) || categoryFromLink(x.link);
      const categoryName = t(x.categoryName) || t(x.title);
      if (!categorySlug || !categoryName) return false;
      const min = Number(x.discountMin);
      const max = Number(x.discountMax);
      return Number.isFinite(min) && Number.isFinite(max) && min >= 0 && max <= 100 && min <= max;
    })
  );
}

/**
 * Public storefront: any section that is missing, empty, or invalid falls back
 * to bundled defaults (same as original static homepage).
 */
export function mergeHomepageForPublic(saved) {
  const defaults = getDefaultHomepageContent();
  const o = saved && typeof saved === "object" ? saved : {};

  const heroSlides = isValidHeroSlides(o.heroSlides)
    ? o.heroSlides
    : defaults.heroSlides;

  const topCategoryStrip = isValidTopCategoryStrip(o.topCategoryStrip)
    ? o.topCategoryStrip
    : defaults.topCategoryStrip;

  let bestDeals = defaults.bestDeals;
  if (isValidBestDealTiles(o.bestDeals?.tiles)) {
    const d = defaults.bestDeals;
    const b = o.bestDeals;
    bestDeals = {
      sectionEyebrow: t(b.sectionEyebrow) || d.sectionEyebrow,
      sectionTitle: t(b.sectionTitle) || d.sectionTitle,
      exploreAllLabel: t(b.exploreAllLabel) || d.exploreAllLabel,
      exploreAllHref: t(b.exploreAllHref) || d.exploreAllHref,
      tiles: b.tiles,
    };
  }

  let trendingFashion = defaults.trendingFashion;
  if (isValidTrendingTiles(o.trendingFashion?.tiles)) {
    const td = defaults.trendingFashion;
    const tf = o.trendingFashion;
    const p = tf.promo || {};
    const promoImage = t(p.image);
    trendingFashion = {
      title: t(tf.title) || td.title,
      subtitle: t(tf.subtitle) || td.subtitle,
      promo: promoImage
        ? {
            image: t(p.image),
            title: t(p.title) || td.promo.title,
            body: t(p.body) || td.promo.body,
            ctaLabel: t(p.ctaLabel) || td.promo.ctaLabel,
            ctaLink: p.ctaLink != null ? String(p.ctaLink).trim() : "",
          }
        : { ...td.promo },
      tiles: tf.tiles,
    };
  }

  let shopByCategory = defaults.shopByCategory;
  if (isValidShopByCategoryCards(o.shopByCategory?.cards)) {
    const d = defaults.shopByCategory;
    const categoryFromLink = (link) => {
      const raw = link != null ? String(link) : "";
      const match = raw.match(/[?&]category=([^&]+)/i);
      if (!match?.[1]) return "";
      try {
        return decodeURIComponent(match[1]).trim().toLowerCase();
      } catch {
        return String(match[1]).trim().toLowerCase();
      }
    };
    const cards = o.shopByCategory.cards.map((card) => ({
      categorySlug: t(card.categorySlug) || categoryFromLink(card.link),
      categoryName: t(card.categoryName) || t(card.title),
      image: t(card.image),
      discountMin: Number(card.discountMin),
      discountMax: Number(card.discountMax),
      ctaText: t(card.ctaText) || "Shop Now",
    }));
    shopByCategory = {
      sectionTitle: t(o.shopByCategory?.sectionTitle) || d.sectionTitle,
      cards,
    };
  }

  const featuredProductIds = normalizeFeaturedProductIds(o.featuredProductIds);

  return {
    featuredProductIds,
    heroSlides,
    topCategoryStrip,
    bestDeals,
    trendingFashion,
    shopByCategory,
    updatedAt: o.updatedAt ?? null,
  };
}
