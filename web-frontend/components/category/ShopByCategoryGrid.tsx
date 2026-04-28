"use client";

import Link from "next/link";
import { useHomepageMerchandising } from "@/context/HomepageMerchandisingContext";

const ShopByCategoryGrid = () => {
  const { payload } = useHomepageMerchandising();
  const sectionTitle = payload?.shopByCategory?.sectionTitle?.trim() || "SHOP BY CATEGORY";
  const cards = payload?.shopByCategory?.cards ?? [];

  if (!cards.length) return null;

  return (
    <section className="max-w-[1700px] mx-auto py-6 sm:py-14 px-2 sm:px-3 lg:px-4 xl:px-5">
      <div className="zk-premium-surface rounded-3xl border border-slate-100/80 p-3 sm:p-5 lg:p-6">
        <h2 className="mb-3 text-[1.04rem] font-extrabold tracking-[0.15em] text-slate-900 sm:mb-7 sm:text-3xl">
          {sectionTitle}
        </h2>
        <div className="sm:hidden grid grid-cols-3 gap-2">
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
                  key={`mobile-${card.categorySlug}-${idx}`}
                  className="group overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm"
                >
                  <div className="relative h-[132px] w-full overflow-hidden bg-slate-100">
                    <img
                      src={card.image}
                      alt={card.categoryName}
                      className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/52 to-transparent px-2 pb-2 pt-8 text-center text-white">
                      <h3
                        className="truncate text-[11px] font-extrabold leading-tight"
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.65)" }}
                      >
                        {card.categoryName}
                      </h3>
                      {discountLabel ? (
                        <p
                          className="mt-0.5 text-[12px] font-black leading-tight tracking-tight"
                          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}
                        >
                          {discountLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>

        <div className="hidden sm:grid grid-cols-[repeat(auto-fill,minmax(165px,1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,minmax(185px,1fr))] sm:gap-5">
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
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/92 via-black/50 to-transparent px-3 pb-3 pt-12 text-center text-white">
                    <h3
                      className="truncate text-base font-extrabold leading-tight tracking-wide sm:text-lg"
                      style={{ textShadow: "0 2px 3px rgba(0,0,0,0.7)" }}
                    >
                      {card.categoryName}
                    </h3>
                    {discountLabel ? (
                      <p
                        className="mt-1 text-lg font-black leading-tight tracking-tight sm:text-xl"
                        style={{ textShadow: "0 2px 3px rgba(0,0,0,0.75)" }}
                      >
                        {discountLabel}
                      </p>
                    ) : null}
                    <p
                      className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/95"
                      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}
                    >
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
