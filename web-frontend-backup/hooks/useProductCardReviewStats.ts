"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { isMongoObjectId } from "@/lib/isMongoObjectId";

/**
 * When list API did not attach rating/reviewCount, pull the same public stats
 * the PDP uses so cards stay in sync with the product detail page.
 */
export function useProductCardReviewStats(productId: string | undefined, skip: boolean) {
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!productId || skip || !isMongoObjectId(productId)) {
      setAvg(null);
      setCount(null);
      return;
    }

    let cancelled = false;
    apiGet<{ stats?: { averageRating: number; totalReviews: number } }>(
      `/api/v1/public/products/${encodeURIComponent(productId)}/reviews?limit=1`
    ).then((res) => {
      if (cancelled || !res.success || !res.data?.stats) return;
      const s = res.data.stats;
      const a = Number(s.averageRating);
      const c = Number(s.totalReviews);
      if (Number.isFinite(a)) setAvg(a);
      if (Number.isFinite(c)) setCount(c);
    });

    return () => {
      cancelled = true;
    };
  }, [productId, skip]);

  return { avg, count };
}
