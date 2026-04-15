"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Star, BadgeCheck, ThumbsUp, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicReviewItem, PublicReviewDistribution } from "@/types/publicReview";

type Props = {
  loading: boolean;
  items: PublicReviewItem[];
  avgRating: number;
  totalReviews: number;
  distribution?: PublicReviewDistribution;
  sort?: "recent" | "helpful";
  onSortChange?: (sort: "recent" | "helpful") => void;
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0][0]?.toUpperCase() || "?";
}

const RatingBar = ({
  stars,
  count,
  total,
}: {
  stars: number;
  count: number;
  total: number;
}) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const barColor =
    stars >= 4 ? "bg-emerald-500" : stars === 3 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-right font-semibold text-gray-700">{stars}</span>
      <Star size={10} className="fill-gray-400 text-gray-400" />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right tabular-nums text-gray-500">{count}</span>
    </div>
  );
};

const ProductRatings = ({
  loading,
  items,
  avgRating,
  totalReviews,
  distribution,
  sort = "recent",
  onSortChange,
}: Props) => {
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);

  const dist = distribution
    ? [5, 4, 3, 2, 1].map((star) => ({
        stars: star,
        count: distribution[star as keyof PublicReviewDistribution] ?? 0,
      }))
    : [5, 4, 3, 2, 1].map((star) => ({
        stars: star,
        count: items.filter((r) => r.rating === star).length,
      }));

  const openLightbox = useCallback(
    (reviewImages: { url?: string; alt?: string }[], idx: number) => {
      const urls = reviewImages
        .map((im) => im?.url?.trim())
        .filter((u): u is string => !!u);
      if (urls.length > 0) setLightbox({ images: urls, index: idx });
    },
    []
  );

  const closeLightbox = () => setLightbox(null);

  const navigateLightbox = (dir: 1 | -1) => {
    if (!lightbox) return;
    const next = (lightbox.index + dir + lightbox.images.length) % lightbox.images.length;
    setLightbox({ ...lightbox, index: next });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-bold uppercase tracking-wide text-gray-900">
          Ratings &amp; Reviews
        </h3>

        {/* Sort controls */}
        {!loading && items.length > 0 && onSortChange && (
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onSortChange("recent")}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                sort === "recent"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Most Recent
            </button>
            <button
              type="button"
              onClick={() => onSortChange("helpful")}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                sort === "helpful"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Most Helpful
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex gap-8">
          <div className="h-16 w-20 animate-pulse rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-2 animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
          {/* overall score */}
          <div className="flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold tabular-nums text-gray-900">
              {avgRating.toFixed(1)}
            </span>
            <div className="mt-1 flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={
                    s <= Math.round(avgRating)
                      ? "fill-teal-500 text-teal-500"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {totalReviews.toLocaleString()} rating{totalReviews !== 1 && "s"}
            </p>
          </div>

          {/* distribution bars */}
          <div className="flex flex-1 flex-col justify-center gap-1.5">
            {dist.map((d) => (
              <RatingBar
                key={d.stars}
                stars={d.stars}
                count={d.count}
                total={totalReviews}
              />
            ))}
          </div>
        </div>
      )}

      {/* call to review */}
      <p className="text-sm text-gray-500">
        Bought this item?{" "}
        <Link
          href="/orders"
          className="font-semibold text-pink-600 hover:underline"
        >
          Rate it from your orders
        </Link>
      </p>

      {/* reviews list */}
      {loading ? (
        <div className="space-y-3 border-t border-gray-100 pt-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="border-t border-gray-100 pt-4 text-sm text-gray-500">
          No reviews yet. Be the first to share your experience!
        </p>
      ) : (
        <ul className="space-y-3 border-t border-gray-100 pt-4">
          {items.map((r) => {
            const dateStr = formatDate(r.createdAt);
            return (
              <li
                key={r._id}
                className="rounded-xl border border-gray-100 bg-white p-4"
              >
                <div className="flex items-start gap-3">
                  {/* avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {r.userId?.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={r.userId.avatar}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(r.userId?.name)
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* rating pill */}
                      <span
                        className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-bold text-white ${
                          r.rating >= 4
                            ? "bg-emerald-600"
                            : r.rating === 3
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                      >
                        {r.rating}
                        <Star size={9} className="fill-white" />
                      </span>

                      <span className="text-sm font-semibold text-gray-800">
                        {r.userId?.name || "Customer"}
                      </span>

                      {r.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600">
                          <BadgeCheck size={12} className="fill-emerald-100 text-emerald-600" />
                          Verified Purchase
                        </span>
                      )}

                      {dateStr && (
                        <span className="text-[11px] text-gray-400">{dateStr}</span>
                      )}
                    </div>

                    {r.title && (
                      <p className="mt-2 text-sm font-semibold text-gray-900">
                        {r.title}
                      </p>
                    )}
                    {r.body && (
                      <p className="mt-1 text-sm leading-relaxed text-gray-600">
                        {r.body}
                      </p>
                    )}

                    {Array.isArray(r.images) && r.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.images.map((im, i) => {
                          const src = im?.url?.trim();
                          if (!src) return null;
                          return (
                            <button
                              key={`${r._id}-img-${i}`}
                              type="button"
                              onClick={() => openLightbox(r.images!, i)}
                              className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition hover:border-gray-400 hover:shadow-sm"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={src}
                                alt={im?.alt || "Review photo"}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* helpful button */}
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
                      >
                        <ThumbsUp size={12} />
                        Helpful
                        {(r.helpfulCount ?? 0) > 0 && (
                          <span className="tabular-nums">({r.helpfulCount})</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {lightbox.images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/30"
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="relative max-h-[80vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.images[lightbox.index]}
              alt="Review photo"
              className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
            />
            {lightbox.images.length > 1 && (
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold tabular-nums text-white">
                {lightbox.index + 1} / {lightbox.images.length}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRatings;
