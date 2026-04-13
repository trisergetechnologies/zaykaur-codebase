export type Product = {
  id: number | string;
  name: string;
  category: string;
  description: string;
  shortDescription?: string;
  aboutItem: string[];
  specifications?: { key: string; value: string }[];
  price: number;
  /** Variant MRP when higher than `price` (API products). */
  mrp?: number;
  discount: number;
  rating: number;
  /** Approved review count from API (list/detail). */
  reviewCount?: number;
  reviews: Review[];
  brand?: string;
  color?: string[];
  stockItems: number;
  images: string[];
  /** All unique image URLs across variants (product detail gallery). */
  allImages?: string[];
  slug?: string;
  parentSlug?: string;
  stock?: number;
  _id?: string;
  variants?: any[];
  variantSelectors?: any[];
  seller?: { name?: string; email?: string };
};

export type Review = {
  author: string;
  image: string;
  content: string;
  rating: number;
  date: Date;
};

export type SearchParams = {
  page: string;
  category: string;
  brand: string;
  search: string;
  min: string;
  max: string;
  color: string;
};

export type CartItem = {
  id: number | string;
  name: string;
  slug?: string;

  price: number;
  originalPrice?: number;
  discount: number;

  images: string[];
  category: string;

  selectedColor?: string;
  quantity: number;

  stock?: number;

  productId?: string;
  variantId?: string;
};

export type CheckoutStep = "cart" | "address" | "payment" | "review";
