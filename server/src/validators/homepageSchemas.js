import { z } from "zod";

const CURATED_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const mongoId = z
  .string()
  .refine((s) => /^[a-fA-F0-9]{24}$/.test(s), "Invalid product id");

const heroSlideSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  images: z.array(z.string().min(1)).min(1),
  button: z.string().min(1),
  discountText: z.string(),
  link: z.string(),
});

const topCategoryStripItemSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().min(1),
});

const bestDealTileSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string(),
  image: z.string().min(1),
  link: z.string(),
  gridClass: z.string().min(1),
  badge: z.string().default(""),
  curatedSlug: z.string().default(""),
  landingTitle: z.string().default(""),
  landingSubtitle: z.string().default(""),
  productIds: z.array(mongoId).max(48).default([]),
});

const trendingTileSchema = z.object({
  title: z.string().min(1),
  image: z.string().min(1),
  link: z.string().default(""),
  curatedSlug: z.string().default(""),
  landingTitle: z.string().default(""),
  landingSubtitle: z.string().default(""),
  productIds: z.array(mongoId).max(48).default([]),
});

const promoSchema = z.object({
  image: z.string().min(1),
  title: z.string().min(1),
  body: z.string(),
  ctaLabel: z.string().min(1),
  ctaLink: z.string().default(""),
});

const shopByCategoryCardSchema = z
  .object({
    categorySlug: z.string().min(1),
    categoryName: z.string().min(1),
    image: z.string().min(1),
    discountMin: z.number().int().min(0).max(100),
    discountMax: z.number().int().min(0).max(100),
    ctaText: z.string().default("Shop Now"),
  })
  .refine((card) => card.discountMin <= card.discountMax, {
    message: "Minimum discount must be less than or equal to maximum discount",
    path: ["discountMin"],
  });

export const homepagePutSchema = z
  .object({
    featuredProductIds: z.array(mongoId).max(30).default([]),
    heroSlides: z.array(heroSlideSchema).min(1),
    topCategoryStrip: z.array(topCategoryStripItemSchema).min(1),
    bestDeals: z.object({
      sectionEyebrow: z.string(),
      sectionTitle: z.string(),
      exploreAllLabel: z.string(),
      exploreAllHref: z.string(),
      tiles: z.array(bestDealTileSchema).min(1),
    }),
    trendingFashion: z.object({
      title: z.string(),
      subtitle: z.string(),
      promo: promoSchema,
      tiles: z.array(trendingTileSchema).min(1),
    }),
    shopByCategory: z.object({
      sectionTitle: z.string(),
      cards: z.array(shopByCategoryCardSchema).min(1),
    }),
  })
  .superRefine((data, ctx) => {
    const slugs = [];

    const checkTiles = (tiles, sectionKey) => {
      tiles.forEach((t, i) => {
        const slug = (t.curatedSlug || "").trim().toLowerCase();
        const pids = t.productIds || [];
        if (!slug) {
          if (pids.length > 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Set a curated slug when product IDs are present",
              path: [sectionKey, "tiles", i, "curatedSlug"],
            });
          }
          return;
        }
        if (!CURATED_SLUG_REGEX.test(slug)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Slug must be lowercase letters, numbers, and single hyphens (e.g. budget-buys)",
            path: [sectionKey, "tiles", i, "curatedSlug"],
          });
          return;
        }
        if (pids.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Curated slug requires at least one product",
            path: [sectionKey, "tiles", i, "productIds"],
          });
          return;
        }
        slugs.push(slug);
      });
    };

    checkTiles(data.bestDeals.tiles, "bestDeals");
    checkTiles(data.trendingFashion.tiles, "trendingFashion");

    if (slugs.length > 0 && new Set(slugs).size !== slugs.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate curated slug — each tile slug must be unique across Best deals and Trending",
        path: ["bestDeals", "tiles"],
      });
    }
  });
