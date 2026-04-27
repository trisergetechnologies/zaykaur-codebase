"use client";

import { useProductCardReviewStats } from "@/hooks/useProductCardReviewStats";
import { calculateDiscount } from "@/lib/calculateDiscount";
import { showToast } from "@/lib/showToast";
import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";
import { Product } from "@/types";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PLACEHOLDER = "https://picsum.photos/seed/placeholder/400/500";

const SingleProductCartView = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const { discount, images, name, price, mrp, rating, stock, id, brand, reviews, reviewCount } = product;

  const hasExplicitMrp = typeof mrp === "number" && mrp > price;
  const discountedPrice = hasExplicitMrp ? price : calculateDiscount(price, discount);
  const strikePrice = hasExplicitMrp ? mrp : discount > 0 ? price : null;
  const count = reviewCount ?? reviews?.length ?? 0;
  const avgRating = Number(rating) || 0;
  const pid = String(product._id ?? id ?? "");
  const hasListReviewStats = avgRating > 0 || count > 0;
  const { avg: fetchedAvg, count: fetchedCount } = useProductCardReviewStats(
    pid || undefined,
    hasListReviewStats
  );
  const displayAvg = fetchedAvg != null ? fetchedAvg : avgRating;
  const displayCount = fetchedCount != null ? fetchedCount : count;
  const outOfStock = (stock ?? product.stockItems ?? 1) === 0;
  const imgSrc = images?.[0] || PLACEHOLDER;

  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(id);

  const handleQuickAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addToCart({
      ...product,
      quantity: 1,
      price: discountedPrice,
      originalPrice: strikePrice ?? price,
    });
    showToast("Item Added To Cart", imgSrc, name);
  };

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    inWishlist ? removeFromWishlist(id) : addToWishlist(product);
  };

  const staggerDelay = Math.min(index * 0.04, 0.6);

  return (
    <Link href={`/shop/product/${id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: staggerDelay }}
        className="zk-card group relative h-full overflow-hidden rounded-xl sm:rounded-2xl bg-white flex flex-col"
      >
        {/* IMAGE */}
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          <Image
            src={imgSrc}
            alt={name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />

          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20">
              <span className="text-[11px] font-semibold text-slate-700 bg-white/80 backdrop-blur px-3 py-1 rounded-full border border-slate-200">
                Sold Out
              </span>
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all duration-200 z-30 ${
              inWishlist
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/25"
                : "bg-white/80 backdrop-blur-sm text-slate-500 hover:text-rose-500 hover:bg-white border border-white/60"
            }`}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={13} fill={inWishlist ? "currentColor" : "none"} strokeWidth={2} />
          </button>

          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-violet-500/90 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md z-30 tracking-wide">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* CONTENT */}
        <div className="relative px-2.5 sm:px-3 pt-2.5 sm:pt-3 pb-2.5 sm:pb-3 flex flex-col gap-1 sm:gap-1.5 flex-1">
          {/* Brand */}
          {brand && (
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.14em] text-slate-400 font-medium truncate">
              {brand}
            </span>
          )}

          {/* Name */}
          <h3 className="text-[12px] sm:text-sm font-semibold text-slate-800 line-clamp-1 sm:line-clamp-2 leading-snug min-h-[1.35em] sm:min-h-[2.4em] group-hover:text-slate-600 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            {displayAvg > 0 ? (
              <>
                <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-semibold text-amber-600">
                  {displayAvg.toFixed(1)}
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                </span>
                {displayCount > 0 && (
                  <span className="text-[9px] sm:text-[10px] text-slate-400">
                    {displayCount} review{displayCount === 1 ? "" : "s"}
                  </span>
                )}
              </>
            ) : (
              <>
                <Star size={11} className="text-slate-300" />
                <span className="text-[9px] sm:text-[10px] text-slate-400">No reviews yet</span>
              </>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1 sm:gap-1.5 mt-0.5 sm:mt-1">
            <span className="text-[15px] sm:text-lg font-normal text-purple-600 leading-none">
              ₹{discountedPrice.toLocaleString()}
            </span>
            {strikePrice != null && strikePrice > discountedPrice && (
              <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                ₹{strikePrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Add to Cart — compact mobile / full desktop */}
          <button
            disabled={outOfStock}
            onClick={handleQuickAdd}
            className="zk-cart-btn mt-1.5 sm:mt-2 w-full flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-[13px] font-semibold tracking-wide transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            <ShoppingBag size={13} strokeWidth={2.2} />
            <span className="sm:hidden">{outOfStock ? "Sold Out" : "Add"}</span>
            <span className="hidden sm:inline">{outOfStock ? "Sold Out" : "Add to Cart"}</span>
          </button>
        </div>
      </motion.div>
    </Link>
  );
};

export default SingleProductCartView;
