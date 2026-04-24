"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import { normalizeProducts } from "@/lib/normalizeProduct";
import type { CuratedCollectionPayload } from "@/types/homepage";
import { Product } from "@/types";
import SingleProductCartView from "@/components/product/SingleProductCartView";

export default function CuratedCollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<CuratedCollectionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    apiGet<CuratedCollectionPayload>(
      `/api/v1/public/homepage/curated/${encodeURIComponent(String(slug))}`
    )
      .then((res) => {
        if (res.success && res.data && Array.isArray(res.data.products)) {
          setState(res.data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-violet-400" size={36} />
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Collection not found</h1>
        <Link
          href="/shop"
          className="mt-4 inline-block text-pink-600 font-semibold hover:underline"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const products: Product[] = normalizeProducts(state.products);

  return (
    <main className="max-w-[1600px] mx-auto px-3 sm:px-6 pb-16 pt-6 sm:pt-10">
      <nav
        className="flex items-center gap-2 text-sm text-slate-500 mb-8 flex-wrap"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-pink-600 transition-colors">
          Home
        </Link>
        <ChevronRight size={14} className="text-slate-300 shrink-0" />
        <Link href="/shop" className="hover:text-pink-600 transition-colors">
          Shop
        </Link>
        <ChevronRight size={14} className="text-slate-300 shrink-0" />
        <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-md">
          {state.title}
        </span>
      </nav>

      <section className="relative rounded-3xl overflow-hidden min-h-[220px] sm:min-h-[280px] mb-10 sm:mb-14 border border-purple-200/40 shadow-lg shadow-violet-200/20">
        {state.heroImage ? (
          <>
            <div className="absolute inset-0">
              <Image
                src={state.heroImage}
                alt=""
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-violet-950/35" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/90 via-purple-700/85 to-slate-900" />
        )}
        <div className="relative z-10 px-6 sm:px-10 lg:px-14 py-10 sm:py-14 max-w-3xl">
          <p className="text-pink-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">
            Curated for you
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            {state.title}
          </h1>
          {state.subtitle ? (
            <p className="mt-4 text-base sm:text-lg text-white/85 max-w-xl leading-relaxed">
              {state.subtitle}
            </p>
          ) : null}
        </div>
      </section>

      <div className="zk-premium-surface rounded-3xl border border-purple-100/80 p-4 sm:p-6 lg:p-8">
        <div className="flex items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Shop the edit
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {products.length}{" "}
              {products.length === 1 ? "piece" : "pieces"} hand-picked by our team
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-slate-500 py-16">
            No products available in this collection right now.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8">
            {products.map((product, index) => (
              <SingleProductCartView key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
