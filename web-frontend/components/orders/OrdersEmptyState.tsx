"use client";

import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OrdersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-950/40">
        <PackageOpen className="h-8 w-8 text-pink-600" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        No orders yet
      </h2>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        When you shop, your orders will show up here with tracking, payment status, and full
        details.
      </p>
      <Button asChild className="mt-6 rounded-lg bg-pink-600 hover:bg-pink-700">
        <Link href="/shop">Start shopping</Link>
      </Button>
    </div>
  );
}
