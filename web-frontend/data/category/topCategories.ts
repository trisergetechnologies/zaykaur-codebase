import { MegaMenuKey } from "../menudata/menu.types";

export type TopCategory = {
  label: string;
  slug: MegaMenuKey;
};

export const topCategories: TopCategory[] = [
  { label: "Electronics", slug: "electronics" },
  { label: "Fashion", slug: "fashion" },
  { label: "Kids", slug: "kids" },
  { label: "TV & Appliances", slug: "tv-appliances" },
  { label: "Furniture", slug: "furniture" },
  { label: "Beauty", slug: "beauty" },
  { label: "Mobiles", slug: "mobiles" },
  { label: "Computers & Laptops", slug: "computers-laptops" },
  { label: "Audio & Headphones", slug: "audio-headphones" },

  { label: "Home & Kitchen", slug: "home-kitchen" },
  { label: "Sports & Fitness", slug: "sports-fitness" },
  { label: "Books", slug: "books" },
  { label: "Toys & Games", slug: "toys-games" },
  { label: "Automotive", slug: "automotive" },
  { label: "Grocery", slug: "grocery" },
  { label: "Health Care", slug: "health-care" },
];