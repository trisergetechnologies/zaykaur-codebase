"use client";

import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 flex flex-col">
      {/* Image placeholder */}
      <Skeleton className="aspect-square sm:aspect-[4/5] w-full rounded-none" />

      {/* Content placeholder */}
      <div className="p-2.5 sm:p-4 flex flex-col gap-2 sm:gap-2.5 flex-1 bg-white/95">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-5 w-10 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="mt-1.5 sm:mt-2 min-h-[44px] w-full rounded-xl" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
