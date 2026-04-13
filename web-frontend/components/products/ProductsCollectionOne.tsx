"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Tabs, TabsContent} from "@/components/ui/tabs";
import { productsData } from "@/data/products/productsData";
import SingleProductCartView from "../product/SingleProductCartView";
import { apiGet } from "@/lib/api";
import { normalizeProducts } from "@/lib/normalizeProduct";
import { Product } from "@/types";

const ProductsCollectionOne = () => {
  const [data, setData] = useState<Product[]>(productsData);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ items: any[]; pagination: any }>("/api/v1/public/products?limit=25")
      .then((res) => {
        if (!cancelled && res.success && res.data?.items?.length > 0) {
          setData(normalizeProducts(res.data.items));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="max-w-[1600px] mx-auto py-14 px-3 lg:px-6">
      <div className="zk-premium-surface rounded-3xl border border-slate-100/80 p-4 sm:p-6 lg:p-8">

      <Tabs defaultValue="top-rated" className="w-full">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-9 gap-4">

          <div className="flex items-center gap-6">

            <h2 className="text-2xl md:text-[2rem] font-extrabold tracking-tight text-slate-900">
              Featured Products
            </h2>

            {/* TABS */}
           
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-7 md:gap-x-5 md:gap-y-8">
            {data.slice(0, 25).map((product) => (
              <SingleProductCartView key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>

        {/* MOST POPULAR */}
        <TabsContent value="most-popular">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-7 md:gap-x-5 md:gap-y-8">
            {data.slice(0, 25).map((product) => (
              <SingleProductCartView key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>

        {/* NEW ARRIVALS */}
        <TabsContent value="new-items">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-7 md:gap-x-5 md:gap-y-8">
            {data.slice(0, 25).map((product) => (
              <SingleProductCartView key={product.id} product={product} />
            ))}
          </div>
        </TabsContent>

      </Tabs>
      </div>
    </section>
  );
};

export default ProductsCollectionOne;
