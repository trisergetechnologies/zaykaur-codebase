"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product } from "@/types";
import type { PublicReviewItem, PublicReviewStats } from "@/types/publicReview";
import { apiGet } from "@/lib/api";
import { isMongoObjectId } from "@/lib/isMongoObjectId";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductDetailAccordion from "./ProductDetailAccordion";
import ProductSeller from "./ProductSeller";
import ProductDelivery from "./ProductDelivery";
import ProductRatings from "./ProductRatings";

type VariantSelector = {
  key: string;
  label: string;
  options: { value: string; inStock: boolean }[];
};

const ProductLayout = ({ product }: { product: Product }) => {
  const variants = (product.variants ?? []) as any[];
  const selectors = (product.variantSelectors ?? []) as VariantSelector[];

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Record<string, string>>({});

  const [reviewsLoading, setReviewsLoading] = useState(() =>
    isMongoObjectId(String(product._id ?? product.id ?? "").trim())
  );
  const [reviewItems, setReviewItems] = useState<PublicReviewItem[]>([]);
  const [avgRating, setAvgRating] = useState(Number(product.rating) || 0);
  const [totalReviews, setTotalReviews] = useState(product.reviewCount ?? 0);

  useEffect(() => {
    const pid = String(product._id ?? product.id ?? "").trim();
    if (!isMongoObjectId(pid)) {
      setReviewsLoading(false);
      setReviewItems([]);
      setAvgRating(Number(product.rating) || 0);
      setTotalReviews(product.reviewCount ?? 0);
      return;
    }
    let cancelled = false;
    setReviewsLoading(true);
    apiGet<{ items: PublicReviewItem[]; stats: PublicReviewStats }>(
      `/api/v1/public/products/${pid}/reviews?limit=20`
    )
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          const s = res.data.stats;
          setAvgRating(s?.averageRating != null ? Number(s.averageRating) : Number(product.rating) || 0);
          setTotalReviews(s?.totalReviews != null ? Number(s.totalReviews) : 0);
          setReviewItems(Array.isArray(res.data.items) ? res.data.items : []);
        } else {
          setAvgRating(Number(product.rating) || 0);
          setTotalReviews(product.reviewCount ?? 0);
          setReviewItems([]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvgRating(Number(product.rating) || 0);
          setTotalReviews(product.reviewCount ?? 0);
          setReviewItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setReviewsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product._id, product.id, product.rating, product.reviewCount]);

  useEffect(() => {
    const list = (product.variants ?? []) as any[];
    const sels = (product.variantSelectors ?? []) as VariantSelector[];
    const v0 = list.find((v: any) => Number(v?.stock ?? 0) > 0) ?? list[0];
    if (!v0?._id) return;
    setSelectedVariantId(String(v0._id));
    if (v0.attributes && sels.length > 0) {
      const next: Record<string, string> = {};
      for (const s of sels) {
        const val = v0.attributes[s.key];
        if (val != null && val !== "") next[s.key] = String(val);
      }
      setSelection(next);
    } else {
      setSelection({});
    }
  }, [product.id, product.variants, product.variantSelectors]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;
    if (selectedVariantId) {
      const byId = variants.find((v: any) => String(v._id) === selectedVariantId);
      if (byId) return byId;
    }
    return variants[0];
  }, [variants, selectedVariantId]);

  useEffect(() => {
    if (!selectedVariant || selectors.length === 0) return;
    const attrs = selectedVariant.attributes || {};
    const next: Record<string, string> = {};
    for (const sel of selectors) {
      const val = attrs[sel.key];
      if (val != null && val !== "") next[sel.key] = String(val);
    }
    setSelection(next);
  }, [selectedVariant, selectors]);

  const handleSelectAttribute = useCallback(
    (key: string, value: string) => {
      const next = { ...selection, [key]: value };
      const fullMatch = variants.find((vr: any) => {
        const a = vr.attributes || {};
        return selectors.every((s) => a[s.key] === next[s.key]);
      });
      if (fullMatch) {
        setSelection(next);
        setSelectedVariantId(String(fullMatch._id));
        return;
      }
      const partial = variants.find((vr: any) => {
        const attrs = vr.attributes || {};
        return selectors.every((sel) => {
          const selected = next[sel.key];
          if (!selected) return true;
          return attrs[sel.key] === selected;
        });
      });
      if (partial) {
        const a = partial.attributes || {};
        const snapped: Record<string, string> = {};
        for (const s of selectors) {
          if (a[s.key] != null) snapped[s.key] = String(a[s.key]);
        }
        setSelection(snapped);
        setSelectedVariantId(String(partial._id));
        return;
      }
      setSelection((prev) => ({ ...prev, [key]: value }));
    },
    [selection, selectors, variants]
  );

  const optionAvailability = useMemo(() => {
    const availability: Record<string, Set<string>> = {};
    for (const sel of selectors) availability[sel.key] = new Set<string>();
    for (const sel of selectors) {
      for (const opt of sel.options) {
        const hasCompatible = variants.some((vr: any) => {
          const attrs = vr.attributes || {};
          if ((vr.stock ?? 0) <= 0) return false;
          if (attrs[sel.key] !== opt.value) return false;
          return selectors.every((other) => {
            if (other.key === sel.key) return true;
            const selected = selection[other.key];
            if (!selected) return true;
            return attrs[other.key] === selected;
          });
        });
        if (hasCompatible) availability[sel.key].add(opt.value);
      }
    }
    return availability;
  }, [selectors, selection, variants]);

  /** Only selected variant images — no mixing other variants (per product requirement). */
  const galleryImages = useMemo(() => {
    const urls: string[] = [];
    const seen = new Set<string>();
    const push = (u: string | undefined) => {
      if (u && typeof u === "string" && !seen.has(u)) {
        seen.add(u);
        urls.push(u);
      }
    };
    const sv = selectedVariant;
    if (sv?.images?.length) {
      for (const img of sv.images) push(typeof img === "string" ? img : img?.url);
    }
    return urls.length ? urls : ["/placeholder-product.png"];
  }, [selectedVariant]);

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 md:pb-0">
      <div className="mx-auto max-w-[1200px] px-3 py-3 md:px-4">
        {/* Classic PDP: gallery left, buy box right — Myntra-inspired */}
        <div className="flex flex-col overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm md:flex-row">
          <div className="border-b border-gray-100 p-3 md:w-[58%] md:border-b-0 md:border-r md:p-5">
            <ProductGallery images={galleryImages} />
          </div>
          <div className="p-3 md:w-[42%] md:p-6">
            <ProductInfo
              product={product}
              reviewSummary={{ loading: reviewsLoading, avgRating, totalReviews }}
              selectedVariant={selectedVariant}
              selection={selection}
              onSelectAttribute={handleSelectAttribute}
              onSelectVariantId={setSelectedVariantId}
              optionAvailability={optionAvailability}
            />
          </div>
        </div>

        <div className="mt-4">
          <ProductDetailAccordion product={product} />
        </div>

        <div className="mt-4 flex flex-col border border-gray-200 bg-white shadow-sm md:flex-row">
          <div className="border-b border-gray-100 p-4 md:w-1/2 md:border-b-0 md:border-r md:p-5">
            <ProductDelivery />
          </div>
          <div className="p-4 md:w-1/2 md:p-5">
            <ProductSeller sellerName={product?.seller?.name || product?.brand} />
          </div>
        </div>

        <div className="mt-4 border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          <ProductRatings
            loading={reviewsLoading}
            items={reviewItems}
            avgRating={avgRating}
            totalReviews={totalReviews}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductLayout;
