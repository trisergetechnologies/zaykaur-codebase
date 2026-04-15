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
};

export type HomepageTrendingTile = {
  title: string;
  image: string;
  link?: string;
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
  updatedAt?: string | null;
};
