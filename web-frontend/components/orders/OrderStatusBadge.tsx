"use client";

import { cn } from "@/lib/utils";

type Props = {
  status: string;
  className?: string;
};

const palette: Record<
  string,
  { bg: string; text: string; ring: string }
> = {
  placed: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-200",
    ring: "ring-amber-200/80 dark:ring-amber-800",
  },
  confirmed: {
    bg: "bg-sky-50 dark:bg-sky-950/40",
    text: "text-sky-800 dark:text-sky-200",
    ring: "ring-sky-200/80 dark:ring-sky-800",
  },
  packed: {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-800 dark:text-indigo-200",
    ring: "ring-indigo-200/80 dark:ring-indigo-800",
  },
  shipped: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-800 dark:text-violet-200",
    ring: "ring-violet-200/80 dark:ring-violet-800",
  },
  in_transit: {
    bg: "bg-violet-50 dark:bg-violet-950/40",
    text: "text-violet-800 dark:text-violet-200",
    ring: "ring-violet-200/80 dark:ring-violet-800",
  },
  out_for_delivery: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-800 dark:text-blue-200",
    ring: "ring-blue-200/80 dark:ring-blue-800",
  },
  delivered: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-200",
    ring: "ring-emerald-200/80 dark:ring-emerald-800",
  },
  returned: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-800 dark:text-orange-200",
    ring: "ring-orange-200/80 dark:ring-orange-800",
  },
  cancelled: {
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-700 dark:text-red-300",
    ring: "ring-red-200/80 dark:ring-red-800",
  },
};

function labelFor(status: string): string {
  const s = status.toLowerCase().replace(/_/g, " ");
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function OrderStatusBadge({ status, className }: Props) {
  const key = (status || "placed").toLowerCase();
  const styles = palette[key] ?? palette.placed;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        styles.bg,
        styles.text,
        styles.ring,
        className
      )}
    >
      {labelFor(key)}
    </span>
  );
}
