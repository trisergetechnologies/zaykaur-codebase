"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useHomepageMerchandising } from "@/context/HomepageMerchandisingContext";
import { normalizeStoreHref } from "@/lib/normalizeStoreHref";
import { trendingTileHref } from "@/lib/homepageTileHref";
import type { HomepageTrendingTile } from "@/types/homepage";

const PREVIEW_IMG_FALLBACK =
  "https://picsum.photos/seed/trending-preview/80/80";

const defaultCategories = [
  {
    title: "Trending Now",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600",
    link: "/shop?category=fashion",
  },
  {
    title: "Budget Buys",
    image:
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600",
    link: "/shop?max=999&sort=price_asc",
  },
  {
    title: "Top Rated Picks",
    image:
      "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=600",
    link: "/shop?sort=latest",
  },
  {
    title: "Daily Essentials",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600",
    link: "/shop?category=kids",
  },
];

const defaultPromo = {
  image:
    "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=800",
  title: "Download Now",
  body: "Get exclusive offers and faster checkout on our app.",
  ctaLabel: "Get App",
  ctaLink: "",
};

const OfferBannerGrid = () => {
  const { payload } = useHomepageMerchandising();
  const tf = payload?.trendingFashion;

  const sectionTitle = tf?.title?.trim() || "Trending Fashion";
  const sectionSubtitle =
    tf?.subtitle?.trim() ||
    "Discover the latest styles, top rated picks and everyday essentials";

  const promo = tf?.promo?.image
    ? {
        image: tf.promo.image,
        title: tf.promo.title || defaultPromo.title,
        body: tf.promo.body || defaultPromo.body,
        ctaLabel: tf.promo.ctaLabel || defaultPromo.ctaLabel,
        ctaLink: (tf.promo.ctaLink || "").trim(),
      }
    : defaultPromo;

  type TrendingCard = HomepageTrendingTile & { link: string };

  const categories: TrendingCard[] =
    tf?.tiles?.length &&
    tf.tiles.every((t) => t.title?.trim() && t.image?.trim())
      ? tf.tiles.map((t) => ({
          title: t.title,
          image: t.image,
          link: (t.link || "").trim(),
          curatedSlug: t.curatedSlug,
          landingTitle: t.landingTitle,
          landingSubtitle: t.landingSubtitle,
          productIds: Array.isArray(t.productIds)
            ? t.productIds.map((id) => String(id))
            : [],
          previewProducts: Array.isArray(t.previewProducts)
            ? t.previewProducts.map((p) => ({
                _id: String(p._id),
                name: p.name,
                slug: p.slug,
                image: p.image,
              }))
            : [],
        }))
      : (defaultCategories as TrendingCard[]);

  return (
    <section className="max-w-[1700px] mx-auto px-2 sm:px-3 lg:px-4 xl:px-5 py-7 sm:py-14">

      {/* SECTION HEADER */}
      <div className="mb-4 sm:mb-10">
        <h2 className="text-[1.38rem] sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {sectionTitle}
        </h2>

        <p className="text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2 text-sm md:text-base max-w-lg">
          {sectionSubtitle}
        </p>
      </div>

      {/* Mobile promo + rail */}
      <div className="lg:hidden space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          viewport={{ once: true }}
          className="relative h-[150px] rounded-2xl overflow-hidden"
        >
          <Image
            src={promo.image}
            alt={promo.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-3 text-white">
            <h2 className="text-lg font-extrabold leading-tight">{promo.title}</h2>
            <p className="text-xs text-gray-100 mt-1 line-clamp-2">{promo.body}</p>
            {promo.ctaLink ? (
              <Link
                href={normalizeStoreHref(promo.ctaLink)}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-white text-black px-3 py-1.5 text-[11px] font-semibold min-h-[32px] w-fit"
              >
                {promo.ctaLabel}
              </Link>
            ) : null}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-2.5">
          {categories.map((item, index) => {
            const previews = item.previewProducts?.filter((p) => p._id) ?? [];
            const inner = (
              <>
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent flex flex-col items-center justify-end px-2.5 pb-2.5">
                  <h3
                    className="text-white text-sm font-extrabold text-center leading-tight"
                    style={{ textShadow: "0 1px 2px rgba(0,0,0,0.7)" }}
                  >
                    {item.title}
                  </h3>
                  {previews.length > 0 ? (
                    <div className="mt-1.5 flex max-w-full gap-1 overflow-x-auto px-1 py-1 scrollbar-hide">
                      {previews.slice(0, 4).map((p) => (
                        <span
                          key={p._id}
                          className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md ring-2 ring-white/45"
                          title={p.name}
                        >
                          <Image
                            src={p.image?.trim() || PREVIEW_IMG_FALLBACK}
                            alt=""
                            width={28}
                            height={28}
                            className="h-full w-full object-cover"
                          />
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            );
            return (
              <motion.div
                key={`mobile-${item.title}-${index}`}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                viewport={{ once: true }}
                className="h-[132px] group relative rounded-2xl overflow-hidden cursor-pointer"
              >
                {item.link?.trim() ||
                ((item.curatedSlug || "").trim() &&
                  (item.productIds?.length ?? 0) > 0) ? (
                  <Link href={trendingTileHref(item)} className="block h-full">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">

        {/* LEFT PROMO BANNER */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="hidden lg:block lg:col-span-2 relative h-[260px] sm:h-[300px] md:h-[360px] lg:h-[min(500px,52vh)] lg:min-h-[360px] rounded-2xl overflow-hidden"
        >
          <Image
            src={promo.image}
            alt={promo.title}
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
            priority={false}
          />

          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-4 sm:p-6 md:p-8 text-white">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
              {promo.title}
            </h2>

            <p className="text-xs sm:text-sm text-gray-200 line-clamp-3 sm:line-clamp-none">
              {promo.body}
            </p>

            {promo.ctaLink ? (
              <Link
                href={normalizeStoreHref(promo.ctaLink)}
                className="mt-3 sm:mt-5 inline-flex items-center justify-center rounded-full bg-white text-black px-4 py-2 sm:px-5 text-xs sm:text-sm font-medium hover:bg-gray-200 min-h-[44px] sm:min-h-0 w-fit"
              >
                {promo.ctaLabel}
              </Link>
            ) : (
              <button
                type="button"
                className="mt-3 sm:mt-5 bg-white text-black px-4 py-2 sm:px-5 rounded-full w-fit text-xs sm:text-sm font-medium hover:bg-gray-200 min-h-[44px] sm:min-h-0 flex items-center justify-center"
              >
                {promo.ctaLabel}
              </button>
            )}
          </div>
        </motion.div>

        {/* CATEGORY CARDS */}
        <div className="hidden lg:grid lg:col-span-3 sm:grid-cols-2 gap-4 sm:gap-6">
          {categories.map((item, index) => {
            const previews = item.previewProducts?.filter((p) => p._id) ?? [];
            const inner = (
              <>
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={300}
                  className="w-full h-[140px] sm:h-[160px] md:h-[180px] object-cover group-hover:scale-110 transition duration-500"
                />

                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center px-2 pb-1 sm:pb-2">
                  <h3 className="text-white text-base sm:text-lg font-semibold text-center">
                    {item.title}
                  </h3>
                  {previews.length > 0 ? (
                    <div className="mt-2 flex max-w-full gap-1.5 overflow-x-auto px-1 py-1 scrollbar-hide">
                      {previews.map((p) => (
                        <span
                          key={p._id}
                          className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-md ring-2 ring-white/40"
                          title={p.name}
                        >
                          <Image
                            src={p.image?.trim() || PREVIEW_IMG_FALLBACK}
                            alt=""
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            );
            return (
              <motion.div
                key={`${item.title}-${index}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer"
              >
                {item.link?.trim() ||
                ((item.curatedSlug || "").trim() &&
                  (item.productIds?.length ?? 0) > 0) ? (
                  <Link href={trendingTileHref(item)} className="block">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </motion.div>
            );
          })}
        </div>

      </div>

    </section>
  );
};

export default OfferBannerGrid;