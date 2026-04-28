"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useHomepageMerchandising } from "@/context/HomepageMerchandisingContext";
import { apiGet } from "@/lib/api";
import { normalizeProducts } from "@/lib/normalizeProduct";
import { Product } from "@/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductCardSkeleton from "../product/ProductCardSkeleton";
import SingleProductCartView from "../product/SingleProductCartView";

const SKELETON_COUNT = 10;

const ProductsCollectionOne = () => {
  const { payload, loading: homepageLoading } = useHomepageMerchandising();
  const [fallbackData, setFallbackData] = useState<Product[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(true);

  const hasFeatured =
    Array.isArray(payload?.featuredProducts) &&
    (payload?.featuredProducts?.length ?? 0) > 0;

  useEffect(() => {
    if (homepageLoading) return;
    if (hasFeatured) {
      setFallbackLoading(false);
      return;
    }
    let cancelled = false;
    setFallbackLoading(true);
    apiGet<{ items: any[]; pagination: any }>("/api/v1/public/products?limit=25")
      .then((res) => {
        if (!cancelled && res.success && res.data?.items?.length > 0) {
          setFallbackData(normalizeProducts(res.data.items));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setFallbackLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [homepageLoading, hasFeatured]);

  const data = hasFeatured
    ? normalizeProducts(payload!.featuredProducts as any[])
    : fallbackData;
  const loading = homepageLoading || (!hasFeatured && fallbackLoading);

  const productsGridClassName =
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-2.5 gap-y-3.5 sm:gap-x-4 sm:gap-y-7 md:gap-x-5 md:gap-y-8";

  return (
    <section className="max-w-[1800px] mx-auto py-7 sm:py-14 px-1 sm:px-2 lg:px-3 xl:px-4">
      <div className="zk-premium-surface rounded-3xl border border-slate-100/80 p-3 sm:p-4 lg:p-5">

      <Tabs defaultValue="top-rated" className="w-full">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 sm:mb-9 gap-3 sm:gap-4">

          <div className="flex items-center gap-6">

            <h2 className="text-[1.85rem] sm:text-2xl md:text-[2rem] font-extrabold tracking-tight text-slate-900">
              Featured Products
            </h2>

          </div>

          {/* VIEW ALL */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            View All
            <ArrowRight size={16} />
          </Link>

        </div>

        {/* PRODUCTS GRID */}

        {/* TOP RATED */}
        <TabsContent value="top-rated">
          {loading ? (
            <div className={productsGridClassName}>
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className={productsGridClassName}>
              {data.slice(0, 25).map((product, index) => (
                <SingleProductCartView key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* MOST POPULAR */}
        <TabsContent value="most-popular">
          <div className={productsGridClassName}>
            {data.slice(0, 25).map((product, index) => (
              <SingleProductCartView key={product.id} product={product} index={index} />
            ))}
          </div>
        </TabsContent>

        {/* NEW ARRIVALS */}
        <TabsContent value="new-items">
          <div className={productsGridClassName}>
            {data.slice(0, 25).map((product, index) => (
              <SingleProductCartView key={product.id} product={product} index={index} />
            ))}
          </div>
        </TabsContent>

      </Tabs>
      </div>
    </section>
  );
};

export default ProductsCollectionOne;
