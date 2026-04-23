"use client";

import { BarChart3 } from "lucide-react";

export function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-10 text-center dark:border-gray-700 dark:bg-gray-900/40">
      <BarChart3 className="h-8 w-8 text-gray-400" aria-hidden />
      <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
