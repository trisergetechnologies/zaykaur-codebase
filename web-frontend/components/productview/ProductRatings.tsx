"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { PublicReviewItem } from "@/types/publicReview";

type Props = {
  loading: boolean;
  items: PublicReviewItem[];
  avgRating: number;
  totalReviews: number;
};

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
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-3 text-right font-semibold text-gray-700">{stars}</span>
      <Star size={10} className="fill-gray-400 text-gray-400" />
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-teal-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 text-right tabular-nums text-gray-500">{count}</span>
    </div>
  );
};

const ProductRatings = ({
  loading,
  items,
  avgRating,
  totalReviews,
}: Props) => {
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    stars: star,
    count: items.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold uppercase tracking-wide text-gray-900">
        Ratings &amp; Reviews
      </h3>

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
            {distribution.map((d) => (
              <RatingBar
                key={d.stars}
                stars={d.stars}
                count={d.count}
                total={items.length}
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
          {items.map((r) => (
            <li
              key={r._id}
              className="rounded-xl border border-gray-100 bg-white p-4"
            >
              <div className="flex items-center gap-3">
                {/* rating pill */}
                <span className="inline-flex items-center gap-0.5 rounded bg-teal-600 px-1.5 py-0.5 text-xs font-bold text-white">
                  {r.rating}
                  <Star size={9} className="fill-white" />
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {r.userId?.name || "Customer"}
                </span>
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
                      <div
                        key={`${r._id}-img-${i}`}
                        className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={im?.alt || "Review photo"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductRatings;
