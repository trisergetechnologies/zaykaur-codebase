"use client";

import { Heart, ShoppingBag, Star, Zap } from "lucide-react";
import useCartStore from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { calculateDiscount } from "@/lib/calculateDiscount";
import type { Product } from "@/types";

type VariantSelector = {
  key: string;
  label: string;
  options: { value: string; inStock: boolean }[];
};

function formatVariantSummary(v: any): string {
  const attrs = v?.attributes;
  if (!attrs || typeof attrs !== "object") return v?.sku || "Option";
  return Object.values(attrs).filter(Boolean).map(String).join(" / ");
}

type Props = {
  product: Product;
  reviewSummary?: { loading: boolean; avgRating: number; totalReviews: number };
  selectedVariant: any | null;
  selection: Record<string, string>;
  onSelectAttribute: (key: string, value: string) => void;
  onSelectVariantId: (id: string) => void;
  optionAvailability?: Record<string, Set<string>>;
};

const isColorKey = (key: string) => /^colou?r$/i.test(key);
const isSizeKey = (key: string) => {
  const k = key.toLowerCase();
  return k === "size" || k === "sizes" || k.includes("size");
};

const ProductInfo = ({
  product,
  reviewSummary,
  selectedVariant,
  selection,
  onSelectAttribute,
  onSelectVariantId,
  optionAvailability,
}: Props) => {
  const router = useRouter();
  const { addToCart } = useCartStore();

  const variants = (product.variants ?? []) as any[];
  const selectors = (product.variantSelectors ?? []) as VariantSelector[];
  const multiVariant = variants.length > 1;

  const vp = selectedVariant;
  const hasVariant = !!vp;

  const saleNum = hasVariant ? Number(vp.price) : Number(product.price);
  const mrpNum =
    hasVariant && vp.mrp != null && Number(vp.mrp) > 0 ? Number(vp.mrp) : undefined;
  const hasExplicitMrp = typeof mrpNum === "number" && mrpNum > saleNum;

  const discountedPrice = hasExplicitMrp
    ? saleNum
    : calculateDiscount(Number(product.price), Number(product.discount || 0));

  const listStrike = hasExplicitMrp ? mrpNum! : Number(product.price);
  const discountPct = hasExplicitMrp
    ? Math.round(((mrpNum! - saleNum) / mrpNum!) * 100)
    : Number(product.discount || 0);

  const stockLeft = hasVariant ? Number(vp.stock ?? 0) : Number(product.stockItems ?? 0);

  const summaryLoading = reviewSummary?.loading ?? false;
  const displayAvg = reviewSummary ? reviewSummary.avgRating : Number(product.rating) || 0;
  const displayCount = reviewSummary ? reviewSummary.totalReviews : product.reviewCount ?? 0;

  const buildCartPayload = () => {
    const firstImg =
      vp?.images?.[0] != null
        ? typeof vp.images[0] === "string"
          ? vp.images[0]
          : vp.images[0]?.url
        : product.images?.[0];
    const listForOriginal = hasExplicitMrp ? mrpNum! : listStrike;
    return {
      id: product.id,
      productId: String(product.id),
      name: product.name,
      price: discountedPrice,
      originalPrice: listForOriginal > discountedPrice ? listForOriginal : undefined,
      quantity: 1,
      images: firstImg ? [firstImg] : product.images,
      category: product.category,
      discount: product.discount,
      variantId: vp?._id != null ? String(vp._id) : undefined,
    };
  };

  const handleAddToCart = () => {
    if (multiVariant && !vp?._id) {
      toast.error("Please select an option");
      return;
    }
    if (stockLeft <= 0) {
      toast.error("This option is out of stock");
      return;
    }
    addToCart(buildCartPayload() as any);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    if (multiVariant && !vp?._id) {
      toast.error("Please select an option");
      return;
    }
    if (stockLeft <= 0) {
      toast.error("This option is out of stock");
      return;
    }
    addToCart(buildCartPayload() as any);
    router.push("/checkout");
  };

  const ctaDisabled = stockLeft <= 0;
  const ctaLabel = ctaDisabled ? "Out of Stock" : "ADD TO BAG";

  const renderSelector = (sel: VariantSelector) => {
    const avail = optionAvailability?.[sel.key];
    const colorMode = isColorKey(sel.key);
    const sizeMode = isSizeKey(sel.key);

    if (colorMode) {
      return (
        <div className="flex flex-wrap gap-2">
          {sel.options.map((opt) => {
            const act = selection[sel.key] === opt.value;
            const ok = avail?.has(opt.value) ?? opt.inStock;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={!ok}
                onClick={() => onSelectAttribute(sel.key, opt.value)}
                title={opt.value}
                className={`relative h-9 w-9 rounded-full border-2 transition ${
                  act ? "border-[#ff3f6c] ring-2 ring-pink-100" : "border-gray-200 hover:border-gray-400"
                } ${!ok ? "cursor-not-allowed opacity-30" : ""}`}
              >
                <span
                  className="absolute inset-1 rounded-full"
                  style={{ backgroundColor: opt.value.toLowerCase() }}
                />
                {!ok && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="block h-[2px] w-full rotate-45 bg-red-400" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    if (sizeMode) {
      return (
        <div className="flex flex-wrap gap-2">
          {sel.options.map((opt) => {
            const act = selection[sel.key] === opt.value;
            const ok = avail?.has(opt.value) ?? opt.inStock;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={!ok}
                onClick={() => onSelectAttribute(sel.key, opt.value)}
                className={`min-h-[38px] min-w-[42px] rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  act
                    ? "border-[#ff3f6c] bg-pink-50 text-[#ff3f6c]"
                    : "border-gray-300 text-gray-800 hover:border-gray-400"
                } ${!ok ? "cursor-not-allowed text-gray-300 line-through opacity-40" : ""}`}
              >
                {opt.value}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <select
        className="w-full max-w-xs rounded border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#ff3f6c] focus:outline-none focus:ring-1 focus:ring-[#ff3f6c]"
        value={selection[sel.key] ?? ""}
        onChange={(e) => onSelectAttribute(sel.key, e.target.value)}
      >
        <option value="" disabled>
          Select {sel.label}
        </option>
        {sel.options.map((opt) => {
          const ok = avail?.has(opt.value) ?? opt.inStock;
          return (
            <option key={opt.value} value={opt.value} disabled={!ok}>
              {opt.value}
              {!ok ? " (Out of stock)" : ""}
            </option>
          );
        })}
      </select>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
          {product.brand || "Zaykaur"}
        </h2>

        <h1 className="text-[17px] font-medium leading-snug text-gray-900 md:text-lg">
          {product.name}
        </h1>

        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-0.5 rounded-sm bg-[#14958f] px-1.5 py-0.5 text-xs font-bold text-white">
            {summaryLoading ? (
              <span className="inline-block h-3 w-4 animate-pulse rounded bg-white/40" />
            ) : (
              displayAvg.toFixed(1)
            )}
            <Star size={10} className="fill-white" />
          </span>
          <span className="text-xs text-gray-500">
            {summaryLoading ? (
              <span className="inline-block h-3 w-16 animate-pulse rounded bg-gray-200" />
            ) : (
              <>{displayCount.toLocaleString()} Ratings</>
            )}
          </span>
        </div>

        <hr className="border-gray-100" />

        {/* Flipkart-style price row */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-2xl font-bold text-gray-900">
            ₹{discountedPrice.toLocaleString()}
          </span>
          {(hasExplicitMrp || product.discount > 0) && listStrike > discountedPrice && (
            <>
              <span className="text-sm text-gray-400 line-through">
                ₹{listStrike.toLocaleString()}
              </span>
              {discountPct > 0 && (
                <span className="text-sm font-semibold text-[#388e3c]">{discountPct}% off</span>
              )}
            </>
          )}
        </div>
        <p className="text-[11px] font-medium text-[#14958f]">inclusive of all taxes</p>

        {multiVariant && (
          <div className="space-y-4 pt-1">
            {selectors.length > 0 ? (
              selectors.map((sel) => (
                <div key={sel.key}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-700">
                    {sel.label}
                    {selection[sel.key] && (isColorKey(sel.key) || isSizeKey(sel.key)) && (
                      <span className="ml-1 font-semibold normal-case text-gray-900">
                        : {selection[sel.key]}
                      </span>
                    )}
                  </p>
                  {renderSelector(sel)}
                </div>
              ))
            ) : (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-700">Variant</p>
                <select
                  className="w-full max-w-xs rounded border border-gray-300 bg-white px-3 py-2.5 text-sm"
                  value={vp?._id ? String(vp._id) : ""}
                  onChange={(e) => onSelectVariantId(e.target.value)}
                >
                  {variants.map((v) => (
                    <option key={String(v._id)} value={String(v._id)}>
                      {formatVariantSummary(v)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Desktop / tablet CTAs */}
        <div className="hidden gap-2 pt-2 md:flex">
          <button
            onClick={handleAddToCart}
            disabled={ctaDisabled}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#ff3f6c] py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#e6335c] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <ShoppingBag size={16} />
            {ctaLabel}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={ctaDisabled}
            className="flex flex-1 items-center justify-center gap-2 rounded-sm border border-gray-300 bg-white py-3 text-xs font-bold uppercase tracking-wider text-gray-800 transition hover:border-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
          >
            <Zap size={16} />
            BUY NOW
          </button>
        </div>

        <button
          type="button"
          className="hidden w-full items-center justify-center gap-2 rounded-sm border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 md:flex"
        >
          <Heart size={14} />
          WISHLIST
        </button>

        {/* Trust row — all requested */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="rounded-sm border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-700">
            Free Delivery
          </span>
          <span className="rounded-sm border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-700">
            Easy Returns
          </span>
          <span className="rounded-sm border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-700">
            Pay on Delivery
          </span>
          <span className="rounded-sm border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-700">
            100% Genuine
          </span>
        </div>
      </div>

      {/* Mobile: sticky bottom bar (Add to bag + Buy now) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 border-t border-gray-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden">
        <button
          onClick={handleAddToCart}
          disabled={ctaDisabled}
          className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-[#ff3f6c] py-3.5 text-xs font-bold uppercase tracking-wide text-white disabled:bg-gray-300"
        >
          <ShoppingBag size={16} />
          {ctaLabel}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={ctaDisabled}
          className="flex flex-1 items-center justify-center gap-2 rounded-sm border-2 border-[#ff3f6c] bg-white py-3.5 text-xs font-bold uppercase tracking-wide text-[#ff3f6c] disabled:border-gray-300 disabled:text-gray-300"
        >
          BUY NOW
        </button>
      </div>
    </>
  );
};

export default ProductInfo;
