"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import ProductLayout from "@/components/productview/ProductLayout";
import RelatedProducts from "@/components/products/RelatedProducts";
import BreadcrumbComponent from "@/components/others/Breadcrumb";
import { productsData } from "@/data/products/productsData";
import { apiGet } from "@/lib/api";
import { isMongoObjectId } from "@/lib/isMongoObjectId";
import { normalizeProduct, normalizeProducts } from "@/lib/normalizeProduct";
import { Product } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

function PDPSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa] overflow-x-hidden">
      <div className="mx-auto max-w-[1200px] px-2.5 py-3 sm:px-3 md:px-4">
        {/* Breadcrumb skeleton */}
        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Main PDP: gallery + buy box */}
        <div className="flex flex-col overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm md:flex-row">
          {/* Gallery skeleton */}
          <div className="border-b border-gray-100 p-3 md:w-[58%] md:border-b-0 md:border-r md:p-5">
            <div className="flex gap-2.5">
              <div className="hidden w-[60px] flex-col gap-1.5 md:flex">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-[58px] w-[58px] rounded" />
                ))}
              </div>
              <Skeleton className="aspect-square flex-1 rounded" />
            </div>
          </div>

          {/* Buy box skeleton */}
          <div className="space-y-4 p-3 md:w-[42%] md:p-6">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-12 rounded-sm" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
            </div>
            <Skeleton className="h-3 w-28" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-16" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-full" />
                ))}
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-12" />
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-11 rounded-full" />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-3">
              <Skeleton className="h-12 flex-1 rounded-sm" />
              <Skeleton className="h-12 flex-1 rounded-sm" />
            </div>
            <Skeleton className="h-10 w-full rounded-sm" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-sm" />
              ))}
            </div>
          </div>
        </div>

        {/* Details skeleton */}
        <div className="mt-4 space-y-3 border border-gray-200 bg-white p-4 shadow-sm">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        {/* Reviews skeleton */}
        <div className="mt-4 space-y-4 border border-gray-200 bg-white p-4 shadow-sm md:p-6">
          <Skeleton className="h-5 w-36" />
          <div className="flex gap-8">
            <Skeleton className="h-16 w-20 rounded-lg" />
            <div className="flex-1 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-2 w-full rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const raw = String(id ?? "").trim();
        let res = await apiGet<any>(`/api/v1/public/products/single/${encodeURIComponent(raw)}`);
        if (!res.success && !isMongoObjectId(raw)) {
          res = await apiGet<any>(`/api/v1/public/products/slug/${encodeURIComponent(raw)}`);
        }
        if (!cancelled && res.success && res.data) {
          const p = normalizeProduct(res.data);
          setProduct(p);

          const relRes = await apiGet<{ items: any[] }>(
            `/api/v1/public/products?category=${encodeURIComponent(p.category)}&limit=6`
          );
          if (!cancelled && relRes.success && relRes.data?.items) {
            setRelated(
              normalizeProducts(relRes.data.items).filter(
                (r) => String(r.id) !== String(p.id)
              )
            );
          }
          return;
        }
      } catch {}

      if (!cancelled) {
        const fallback = productsData.find(
          (item) => String(item.id) === String(id)
        );
        if (fallback) {
          setProduct(fallback);
          setRelated(
            productsData.filter(
              (item) =>
                item.category === fallback.category && item.id !== fallback.id
            )
          );
        }
      }
    };

    load().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <PDPSkeleton />;

  if (!product) return notFound();

  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-8 flex flex-col gap-6">
      <BreadcrumbComponent
        links={["/shop", `/shop?category=${product.category}`]}
        pageText={product.name}
      />
      <ProductLayout product={product} />
      <RelatedProducts products={related} />
    </div>
  );
}
