"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react"; // npm i lucide-react
import { useHomepageMerchandising } from "@/context/HomepageMerchandisingContext";
import { bestDealTileHref } from "@/lib/homepageTileHref";
import { normalizeStoreHref } from "@/lib/normalizeStoreHref";

const defaultDeals = [
  {
    title: "Trending Now",
    subtitle: "Latest Fashion Picks",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=900",
    link: "/shop?category=fashion",
    gridClass: "lg:col-span-2 lg:row-span-2",
    badge: "Hot"
  },
  {
    title: "Budget Buys",
    subtitle: "Under ₹999",
    image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=900",
    link: "/shop?max=999&sort=price_asc",
    gridClass: "lg:col-span-2 lg:row-span-1",
    badge: "Sale"
  },
  {
    title: "Top Rated",
    subtitle: "Customer Favorites",
    image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=900",
    link: "/shop?sort=latest",
    gridClass: "lg:col-span-1 lg:row-span-1",
  },
  {
    title: "Essentials",
    subtitle: "Daily Comfort",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=900",
    link: "/shop?category=kids",
    gridClass: "lg:col-span-1 lg:row-span-1",
  },
];

const BestDealsSection = () => {
  const { payload } = useHomepageMerchandising();
  const bd = payload?.bestDeals;
  const deals =
    bd?.tiles?.length &&
    bd.tiles.every(
      (t) =>
        t.title?.trim() &&
        t.image?.trim() &&
        t.gridClass?.trim()
    )
      ? bd.tiles.map((t) => ({
          title: t.title,
          subtitle: t.subtitle,
          image: t.image,
          link: t.link,
          gridClass: t.gridClass,
          badge: t.badge,
        }))
      : defaultDeals;

  const sectionEyebrow = bd?.sectionEyebrow?.trim() || "Exclusive Offers";
  const sectionTitle = bd?.sectionTitle?.trim() || "BEST DEALS";
  const exploreLabel = bd?.exploreAllLabel?.trim() || "Explore All Deals";
  const exploreHref = normalizeStoreHref(bd?.exploreAllHref || "/shop");

  return (
    <section className="max-w-[1400px] mx-auto px-3 sm:px-6 py-12 sm:py-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
        <div>
          <span className="text-pink-600 font-bold tracking-widest uppercase text-sm">{sectionEyebrow}</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-2 italic">
            {sectionTitle}
            <span className="text-pink-600">.</span>
          </h2>
        </div>

        <Link
          href={exploreHref}
          className="group flex items-center gap-2 text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-pink-600 transition-colors shrink-0"
        >
          {exploreLabel}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 h-auto lg:h-[700px]">
        {deals.map((deal, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            className={`${deal.gridClass} relative min-h-[220px] sm:min-h-[200px] lg:min-h-0 group cursor-pointer overflow-hidden rounded-3xl bg-gray-100`}
          >
            <Link href={bestDealTileHref(deal)} className="block w-full h-full">
              {/* Image with Parallax-like hover */}
              <Image
                src={deal.image}
                alt={deal.title}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />

              {/* Badge */}
              {deal.badge && (
                <div className="absolute top-5 left-5 z-20">
                  <span className="bg-white/90 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                    {deal.badge}
                  </span>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <p className="text-pink-400 text-xs font-bold uppercase mb-1 tracking-widest">
                  {deal.subtitle}
                </p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                  {deal.title}
                </h3>
                
                {/* Revealable Button */}
                <div className="overflow-hidden">
                  <span className="inline-flex items-center gap-2 text-white text-sm font-semibold border-b border-white/50 pb-1 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-full group-hover:translate-y-0">
                    Shop Collection
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default BestDealsSection;