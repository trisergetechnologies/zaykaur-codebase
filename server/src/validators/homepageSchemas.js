import { z } from "zod";

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
});

const trendingTileSchema = z.object({
  title: z.string().min(1),
  image: z.string().min(1),
  link: z.string().default(""),
});

const promoSchema = z.object({
  image: z.string().min(1),
  title: z.string().min(1),
  body: z.string(),
  ctaLabel: z.string().min(1),
  ctaLink: z.string().default(""),
});

export const homepagePutSchema = z.object({
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
});
