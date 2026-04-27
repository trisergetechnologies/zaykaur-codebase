"use client";

import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl sm:rounded-2xl bg-white flex flex-col zk-card">
      <Skeleton className="aspect-square w-full rounded-none" />

      <div className="px-2.5 sm:px-3 pt-2.5 sm:pt-3 pb-2.5 sm:pb-3 flex flex-col gap-1.5 sm:gap-2 flex-1">
        <Skeleton className="h-2.5 w-12 sm:w-14 rounded" />
        <Skeleton className="h-3.5 w-full rounded" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-8 rounded" />
          <Skeleton className="h-2.5 w-12 sm:w-16 rounded" />
        </div>
        <div className="flex items-baseline gap-1.5 mt-0.5 sm:mt-1">
          <Skeleton className="h-4 sm:h-5 w-14 sm:w-16 rounded" />
          <Skeleton className="h-3 w-10 rounded" />
        </div>
        <Skeleton className="mt-1.5 sm:mt-2 h-8 sm:h-10 w-full rounded-lg sm:rounded-xl" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
