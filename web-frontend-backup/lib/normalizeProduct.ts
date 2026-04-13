import { Product } from "@/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function collectAllVariantImages(p: any): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  for (const v of p.variants ?? []) {
    for (const img of v?.images ?? []) {
      const u = typeof img === "string" ? img : img?.url;
      if (typeof u === "string" && u.trim() && !seen.has(u)) {
        seen.add(u);
        urls.push(u);
      }
    }
  }
  if (urls.length > 0) return urls;
  const legacy = p.images;
  if (Array.isArray(legacy)) {
    for (const u of legacy) {
      if (typeof u === "string" && u.trim() && !seen.has(u)) {
        seen.add(u);
        urls.push(u);
      }
    }
  }
  return urls;
}

function normalizeVariantImages(variant: any): { url: string; alt: string }[] {
  const raw = Array.isArray(variant?.images) ? variant.images : [];
  return raw
    .map((img: any) => {
      if (typeof img === "string") return { url: img.trim(), alt: "" };
      return {
        url: String(img?.url || "").trim(),
        alt: String(img?.alt || "").trim(),
      };
    })
    .filter((img) => !!img.url);
}

export function normalizeProduct(p: any): Product {
  const variant = p.variants?.[0];

  const price = variant?.price ?? p.price ?? 0;
  const mrp = variant?.mrp ?? price;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : p.discount ?? 0;
  const mrpOut =
    variant?.mrp != null && Number(variant.mrp) > 0 ? Number(variant.mrp) : undefined;
  const stock = variant?.stock ?? p.stockItems ?? 0;

  const normalizedVariants = (p.variants ?? []).map((v: any) => ({
    ...v,
    images: normalizeVariantImages(v),
  }));

  const images: string[] = normalizedVariants?.[0]?.images?.map((img: any) => img.url) ?? p.images ?? [];

  const allColors = (p.variants ?? [])
    .map((v: any) => v.attributes?.color)
    .filter(Boolean) as string[];
  const uniqueColors = [...new Set(allColors)];

  const categoryName =
    typeof p.category === "object" ? p.category?.name : p.category ?? "";

  const slug =
    p.slug ??
    (typeof p.category === "object" ? p.category?.slug : undefined);

  const normalizedHighlights = Array.isArray(p?.productDetails?.highlights)
    ? p.productDetails.highlights.map((item: any) => String(item || "").trim()).filter(Boolean)
    : [];
  const normalizedSpecifications = Array.isArray(p?.productDetails?.specifications)
    ? p.productDetails.specifications
        .map((spec: any) => ({
          key: String(spec?.key || "").trim(),
          value: String(spec?.value || "").trim(),
        }))
        .filter((spec: any) => spec.key && spec.value)
    : [];

  return {
    id: p._id ?? p.id,
    name: p.name ?? "",
    category: categoryName,
    description: p.description ?? "",
    shortDescription: String(p?.productDetails?.shortDescription || "").trim() || undefined,
    aboutItem: normalizedHighlights.length
      ? normalizedHighlights
      : p.aboutItem ?? (p.description ? [p.description] : []),
    specifications: normalizedSpecifications,
    price,
    mrp: mrpOut,
    discount,
    rating: (() => {
      const raw = p.rating ?? p.averageRating ?? p.stats?.averageRating;
      if (raw == null || raw === "") return 0;
      const n = Number(raw);
      return Number.isFinite(n) ? n : 0;
    })(),
    reviewCount: (() => {
      if (p.reviewCount != null) return Number(p.reviewCount) || 0;
      if (p.totalReviews != null) return Number(p.totalReviews) || 0;
      if (p.stats?.totalReviews != null) return Number(p.stats.totalReviews) || 0;
      return Array.isArray(p.reviews) ? p.reviews.length : 0;
    })(),
    reviews: p.reviews ?? [],
    brand: p.brand ?? "",
    color: uniqueColors.length > 0 ? uniqueColors : p.color ?? [],
    stockItems: stock,
    images,
    allImages: collectAllVariantImages(p),
    slug,
    parentSlug: p.parentSlug,
    stock,
    _id: p._id,
    variants: normalizedVariants,
    variantSelectors: p.variantSelectors,
    seller:
      typeof p.seller === "object" && p.seller != null
        ? { name: p.seller.name, email: p.seller.email }
        : undefined,
  };
}

export function normalizeProducts(items: any[]): Product[] {
  return (items ?? []).map(normalizeProduct);
}
