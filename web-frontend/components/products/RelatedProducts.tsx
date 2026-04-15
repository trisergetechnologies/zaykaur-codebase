"use client";

import React from "react";
import SingleProductCartView from "../product/SingleProductCartView";
import { Product } from "@/types";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface RelatedProductsProps {
  products: Product[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-12 sm:py-20 bg-white border-t border-slate-100 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 md:px-12">
        <div className="zk-premium-surface rounded-3xl border border-slate-100/80 p-4 sm:p-5 md:p-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-10 gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
              <Sparkles size={14} />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              You May Also <span className="text-slate-400 font-light">Like</span>
            </h2>
          </div>

          <Link
            href="/shop"
            className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-900 group border-b-2 border-slate-900 pb-1 hover:text-blue-600 hover:border-blue-600 transition-all"
          >
            View Entire Collection
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* THE FIXED GRID/SCROLL AREA */}
        <div className="relative -mx-3 px-3 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
          <div className="
            flex 
            overflow-x-auto 
            pb-8 
            snap-x 
            snap-mandatory 
            no-scrollbar
            gap-5
            md:grid 
            md:grid-cols-3 
            lg:grid-cols-4 
            xl:grid-cols-5 
            md:gap-6
          ">
            {products.slice(0, 5).map((product) => (
              <div 
                key={product.id} 
                className="
                  min-w-[min(72vw,280px)]
                  sm:min-w-[280px] 
                  md:min-w-0
                  snap-center
                  first:ml-0
                "
              >
                <SingleProductCartView product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* MOBILE CTA */}
        <div className="mt-4 md:hidden">
          <Link
            href="/shop"
            className="flex items-center justify-center w-full py-4 rounded-2xl bg-white text-slate-900 font-bold text-sm border border-slate-200 active:scale-[0.98] transition-transform"
          >
            Explore More Products
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;