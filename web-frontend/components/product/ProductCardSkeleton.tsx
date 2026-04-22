"use client";

import { Skeleton } from "@/components/ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-2xl bg-white flex flex-col zk-card">
      <Skeleton className="aspect-square w-full rounded-none" />

      <div className="px-3 pt-3 pb-3 flex flex-col gap-2 flex-1">
        <Skeleton className="h-2.5 w-14 rounded" />
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-3/4 rounded" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-3 w-8 rounded" />
          <Skeleton className="h-2.5 w-16 rounded" />
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-3 w-10 rounded" />
        </div>
        <Skeleton className="mt-2 h-10 w-full rounded-xl" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
