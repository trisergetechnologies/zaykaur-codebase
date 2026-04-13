"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";
import {
  ORDER_TIMELINE_STEPS,
  isTerminalProblemStatus,
  orderStatusIndex,
} from "@/lib/customerOrder";
import { Check, XCircle } from "lucide-react";

type Props = {
  status: string;
  className?: string;
};

export function OrderTimeline({ status, className }: Props) {
  const current = (status || "placed").toLowerCase();
  const idx = orderStatusIndex(current);
  const problem = isTerminalProblemStatus(current);

  if (problem) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40",
          className
        )}
      >
        <div className="flex items-center gap-3 text-sm">
          <XCircle className="h-5 w-5 shrink-0 text-red-500" aria-hidden />
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {current === "cancelled" ? "Order cancelled" : "Order returned"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This order is closed. Contact support if you need help.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60",
        className
      )}
    >
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Order progress
      </p>
      <div className="flex min-w-[720px] items-start">
        {ORDER_TIMELINE_STEPS.map((step, i) => {
          const done = idx >= i;
          const active = idx === i;
          const last = i === ORDER_TIMELINE_STEPS.length - 1;

          return (
            <Fragment key={step.key}>
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    done
                      ? "bg-pink-600 text-white"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
                    active && done && "ring-4 ring-pink-100 dark:ring-pink-900/50"
                  )}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </div>
                <span
                  className={cn(
                    "mt-2 max-w-[100px] text-center text-[11px] font-medium leading-tight sm:text-xs",
                    done ? "text-slate-900 dark:text-slate-100" : "text-slate-400"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!last && (
                <div
                  className={cn(
                    "mt-4 h-0.5 flex-1 min-w-[8px] rounded-full",
                    idx > i ? "bg-pink-600" : "bg-slate-200 dark:bg-slate-700"
                  )}
                  aria-hidden
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
