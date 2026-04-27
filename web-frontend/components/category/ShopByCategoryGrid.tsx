"use client";

import Link from "next/link";
import { useHomepageMerchandising } from "@/context/HomepageMerchandisingContext";

const ShopByCategoryGrid = () => {
  const { payload } = useHomepageMerchandising();
  const sectionTitle = payload?.shopByCategory?.sectionTitle?.trim() || "SHOP BY CATEGORY";
  const cards = payload?.shopByCategory?.cards ?? [];

  if (!cards.length) return null;

  return (
    <section className="max-w-[1600px] mx-auto py-10 sm:py-14 px-3 lg:px-6">
      <div className="zk-premium-surface rounded-3xl border border-slate-100/80 p-4 sm:p-6 lg:p-8">
        <h2 className="mb-6 text-xl font-extrabold tracking-[0.18em] text-slate-900 sm:mb-7 sm:text-3xl">
          {sectionTitle}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(185px,1fr))] sm:gap-5">
          {cards.map((card, idx) => {
            const min = Number(card.discountMin);
            const max = Number(card.discountMax);
            const discountLabel =
              Number.isFinite(min) && Number.isFinite(max) ? `${min}-${max}% OFF` : "";
            const categorySlug = (card.categorySlug || "").trim();
            const href = new URLSearchParams();
            if (categorySlug) href.set("category", categorySlug);
            if (Number.isFinite(min)) href.set("discountMin", String(min));
            if (Number.isFinite(max)) href.set("discountMax", String(max));
            return (
              <Link
                href={`/shop${href.toString() ? `?${href.toString()}` : ""}`}
                key={`${card.categorySlug}-${idx}`}
                className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-[250px] w-full overflow-hidden bg-slate-100">
                  <img
                    src={card.image}
                    alt={card.categoryName}
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/78 via-black/32 to-transparent px-3 pb-3 pt-12 text-center text-white">
                    <h3 className="truncate text-base font-extrabold leading-tight tracking-wide sm:text-lg">
                      {card.categoryName}
                    </h3>
                    {discountLabel ? (
                      <p className="mt-1 text-lg font-black leading-tight tracking-tight sm:text-xl">
                        {discountLabel}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/95">
                      {(card.ctaText || "Shop Now").trim() || "Shop Now"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ShopByCategoryGrid;
