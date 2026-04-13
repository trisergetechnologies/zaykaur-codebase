import { Star } from "lucide-react";

type Props = { rating: number; review: number };

const RatingReview = ({ rating, review }: Props) => {
  const rounded = Math.round(Number(rating) || 0);

  if (review <= 0 && rounded <= 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-slate-400">
        <Star size={14} className="shrink-0 text-slate-300" />
        <span>No reviews yet</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1 text-amber-600">
      <span className="text-sm font-semibold text-slate-900 dark:text-white">
        {(Number(rating) || 0).toFixed(1)}
      </span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={14}
            className={i <= rounded ? "fill-amber-400 text-amber-400" : "text-slate-300"}
          />
        ))}
      </div>
      <span className="h-4 w-px bg-slate-300 dark:bg-slate-600" aria-hidden />
      <span className="text-sm text-slate-600 dark:text-slate-300">
        {review} review{review === 1 ? "" : "s"}
      </span>
    </div>
  );
};

export default RatingReview;
