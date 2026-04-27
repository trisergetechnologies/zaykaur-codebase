export type HomepageHeroSlide = {
  title: string;
  description: string;
  images: string[];
  button: string;
  discountText: string;
  link: string;
};

export type HomepageStripItem = {
  name: string;
  slug: string;
  image: string;
};

export type HomepageBestDealTile = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  gridClass: string;
  badge?: string;
  curatedSlug?: string;
  landingTitle?: string;
  landingSubtitle?: string;
  productIds?: string[];
};

export type HomepageTrendingTilePreview = {
  _id: string;
  name: string;
  slug: string;
  image: string;
};

export type HomepageTrendingTile = {
  title: string;
  image: string;
  link?: string;
  curatedSlug?: string;
  landingTitle?: string;
  landingSubtitle?: string;
  productIds?: string[];
  /** Populated by public homepage API when tile has productIds */
  previewProducts?: HomepageTrendingTilePreview[];
};

export type HomepageShopByCategoryCard = {
  categorySlug: string;
  categoryName: string;
  image: string;
  discountMin: number;
  discountMax: number;
  ctaText?: string;
};

export type HomepagePayload = {
  heroSlides: HomepageHeroSlide[];
  topCategoryStrip: HomepageStripItem[];
  bestDeals: {
    sectionEyebrow: string;
    sectionTitle: string;
    exploreAllLabel: string;
    exploreAllHref: string;
    tiles: HomepageBestDealTile[];
  };
  trendingFashion: {
    title: string;
    subtitle: string;
    promo: {
      image: string;
      title: string;
      body: string;
      ctaLabel: string;
      ctaLink?: string;
    };
    tiles: HomepageTrendingTile[];
  };
  shopByCategory: {
    sectionTitle: string;
    cards: HomepageShopByCategoryCard[];
  };
  /** Raw API products when admin configured featured IDs (use normalizeProducts). */
  featuredProducts?: unknown[];
  updatedAt?: string | null;
};

export type CuratedCollectionPayload = {
  slug: string;
  title: string;
  subtitle: string;
  heroImage: string;
  products: unknown[];
};
