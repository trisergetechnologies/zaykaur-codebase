"use client";

import { cn } from "@/lib/utils";

/** Matches SignInForm right column spacing and control shapes (inputs h-10, bordered). */
export function SignInRightColumnSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn("relative w-full max-w-md", className)}
      aria-busy="true"
      aria-label="Loading sign-in form"
    >
      <div className="mb-10 space-y-2 text-center lg:text-left">
        <div className="mx-auto h-9 w-44 animate-pulse rounded-lg bg-muted/70 lg:mx-0" />
        <div className="mx-auto h-5 max-w-[280px] animate-pulse rounded-md bg-muted/50 lg:mx-0" />
      </div>

      <div className="h-[52px] w-full animate-pulse rounded-md border-2 border-gray-200 bg-muted/25 dark:border-gray-800" />

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-gray-400 dark:bg-gray-950">
            Or use your email
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted/80" />
          <div className="h-10 w-full animate-pulse rounded-md border border-input bg-muted/30" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 animate-pulse rounded-md bg-muted/80" />
            <div className="h-3 w-14 animate-pulse rounded-md bg-muted/60" />
          </div>
          <div className="h-10 w-full animate-pulse rounded-md border border-input bg-muted/30" />
        </div>
        <div className="h-[52px] w-full animate-pulse rounded-md bg-pink-600/30 dark:bg-pink-600/40" />
      </div>

      <div className="mt-8 flex justify-center gap-2 text-sm lg:justify-start">
        <div className="h-4 w-36 animate-pulse rounded-md bg-muted/50" />
        <div className="h-4 w-28 animate-pulse rounded-md bg-muted/60" />
      </div>
    </div>
  );
}
