"use client";

import type { ReactNode } from "react";

type Props = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
};

export function KpiCard({ label, value, hint, icon }: Props) {
  return (
    <div className="group premium-card border border-[color-mix(in_srgb,var(--color-gray-200)_88%,transparent)] p-5 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 dark:border-white/[0.08] md:p-6">
      <div className="flex items-start gap-4">
        {icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/[0.12] dark:text-brand-400">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p className="mt-1.5 truncate text-xl font-bold tracking-tight text-gray-900 dark:text-white/95 md:text-2xl">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
