import mongoose from "mongoose";

const heroSlideSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    images: { type: [String], default: [] },
    button: { type: String, default: "Shop Now" },
    discountText: { type: String, default: "" },
    link: { type: String, default: "" },
  },
  { _id: false }
);

const topCategoryStripItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, required: true },
  },
  { _id: false }
);

const bestDealTileSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    image: { type: String, required: true },
    link: { type: String, default: "" },
    gridClass: { type: String, default: "lg:col-span-1 lg:row-span-1" },
    badge: { type: String, default: "" },
    curatedSlug: { type: String, default: "" },
    landingTitle: { type: String, default: "" },
    landingSubtitle: { type: String, default: "" },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { _id: false }
);

const trendingTileSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
    link: { type: String, default: "" },
    curatedSlug: { type: String, default: "" },
    landingTitle: { type: String, default: "" },
    landingSubtitle: { type: String, default: "" },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { _id: false }
);

const shopByCategoryCardSchema = new mongoose.Schema(
  {
    categorySlug: { type: String, required: true },
    categoryName: { type: String, required: true },
    image: { type: String, required: true },
    discountMin: { type: Number, min: 0, max: 100, required: true },
    discountMax: { type: Number, min: 0, max: 100, required: true },
    ctaText: { type: String, default: "Shop Now" },
  },
  { _id: false }
);

const homepageContentSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "main", index: true },
    featuredProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    heroSlides: { type: [heroSlideSchema], default: [] },
    topCategoryStrip: { type: [topCategoryStripItemSchema], default: [] },
    bestDeals: {
      sectionEyebrow: { type: String, default: "" },
      sectionTitle: { type: String, default: "" },
      exploreAllLabel: { type: String, default: "Explore All Deals" },
      exploreAllHref: { type: String, default: "/shop" },
      tiles: { type: [bestDealTileSchema], default: [] },
    },
    trendingFashion: {
      title: { type: String, default: "" },
      subtitle: { type: String, default: "" },
      promo: {
        image: { type: String, default: "" },
        title: { type: String, default: "" },
        body: { type: String, default: "" },
        ctaLabel: { type: String, default: "" },
        ctaLink: { type: String, default: "" },
      },
      tiles: { type: [trendingTileSchema], default: [] },
    },
    shopByCategory: {
      sectionTitle: { type: String, default: "SHOP BY CATEGORY" },
      cards: { type: [shopByCategoryCardSchema], default: [] },
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const HomepageContent = mongoose.model("HomepageContent", homepageContentSchema);

export default HomepageContent;
