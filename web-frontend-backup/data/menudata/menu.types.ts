export type MegaMenuColumn = {
  columnTitle: string;
  items: string[];
};

export type MegaMenuKey =
  | "electronics"
  | "fashion"
  | "kids"
  | "tv-appliances"
  | "furniture"
  | "beauty"
  | "mobiles"
  | "computers-laptops"
  | "audio-headphones"
  | "home-kitchen"
  | "sports-fitness"
  | "books"
  | "toys-games"
  | "automotive"
  | "grocery"
  | "health-care";

export type MegaMenuData = Record<MegaMenuKey, MegaMenuColumn[]>;