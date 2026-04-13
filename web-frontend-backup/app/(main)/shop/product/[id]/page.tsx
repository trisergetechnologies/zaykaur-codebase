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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
