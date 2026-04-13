"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";
import { calculateDiscount } from "@/lib/calculateDiscount";
import { Heart, ShoppingCart, Star } from "lucide-react";
import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";
import { showToast } from "@/lib/showToast";
import { motion } from "framer-motion";
import { useProductCardReviewStats } from "@/hooks/useProductCardReviewStats";

const PLACEHOLDER = "https://picsum.photos/seed/placeholder/400/500";

const SingleProductCartView = ({ product }: { product: Product }) => {
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

  return (
    <Link href={`/shop/product/${id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -7 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="zk-premium-card group relative h-full overflow-hidden rounded-3xl border border-white/70 bg-white/90 backdrop-blur-sm flex flex-col"
      >
        <span className="zk-card-gradient-ring pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* IMAGE */}
        <div className="relative aspect-[4/5] bg-slate-100/70 overflow-hidden">
          <Image
            src={imgSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent" />

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="zk-glass-chip text-xs font-semibold px-4 py-1.5 rounded-full text-slate-900">
                Out of Stock
              </span>
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 z-30 ${
              inWishlist
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                : "zk-glass-chip text-slate-600 hover:text-rose-500"
            }`}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={16} fill={inWishlist ? "currentColor" : "none"} />
          </button>

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 zk-discount-chip text-[11px] font-bold px-2.5 py-1 rounded-full z-30">
              {discount}% OFF
            </div>
          )}

        </div>

        {/* CONTENT */}
        <div className="relative p-4 flex flex-col gap-2 flex-1 bg-white/95">
          {/* Brand */}
          {brand && (
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold truncate">
              {brand}
            </span>
          )}

          {/* Name */}
          <h3 className="text-[15px] font-semibold text-slate-900 line-clamp-2 leading-snug transition min-h-[2.7rem] group-hover:text-slate-700">
            {name}
          </h3>

          {/* Reviews — matches PDP public review stats when list payload omits them */}
          <div className="flex min-h-[1.35rem] flex-wrap items-center gap-1.5">
            {displayAvg > 0 ? (
              <>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                  {displayAvg.toFixed(1)}
                  <Star size={9} className="fill-white" />
                </span>
                <span className="text-xs text-slate-500">
                  {displayCount > 0
                    ? `${displayCount.toLocaleString()} review${displayCount === 1 ? "" : "s"}`
                    : ""}
                </span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Star size={12} className="shrink-0 text-slate-300" />
                No reviews yet
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mt-auto pt-1.5">
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              ₹{discountedPrice.toLocaleString()}
            </span>
            {strikePrice != null && strikePrice > discountedPrice && (
              <span className="text-xs text-slate-400 line-through">
                ₹{strikePrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <button
            disabled={outOfStock}
            onClick={handleQuickAdd}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white zk-premium-button disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <ShoppingCart size={14} />
            {outOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </motion.div>
    </Link>
  );
};

export default SingleProductCartView;
