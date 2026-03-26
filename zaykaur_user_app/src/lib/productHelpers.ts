import type { ApiProduct } from "../types/api";

export interface ProductDisplay {
  id: string;
  variantId: string | null;
  name: string;
  slug: string;
  price: number;
  mrp?: number;
  discount: number;
  images: string[];
  categoryName: string;
  stock: number;
  rating?: number;
}

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/300x300?text=Product";

export function apiProductToDisplay(p: ApiProduct): ProductDisplay {
  const variant = p.variants?.[0];
  const price = variant?.price ?? 0;
  const mrp = variant?.mrp ?? price;
  const categoryName =
    typeof p.category === "object" && p.category?.name
      ? p.category.name
      : String(p.category ?? "");
  const images =
    variant?.images?.map((i) => i?.url).filter(Boolean) ?? [];
  return {
    id: p._id,
    variantId: variant?._id ?? null,
    name: p.name,
    slug: p.slug,
    price,
    mrp,
    discount:
      mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
    images: images.length ? (images as string[]) : [PLACEHOLDER_IMAGE],
    categoryName,
    stock: variant?.stock ?? 0,
    rating: 4,
  };
}
