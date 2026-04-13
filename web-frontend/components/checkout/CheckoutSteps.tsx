"use client";

import { CheckoutStep } from "@/types";
import { cn } from "@/lib/utils";

const steps = [
  { key: "cart", label: "Cart" },
  { key: "address", label: "Address" },
  { key: "payment", label: "Payment" },
  { key: "review", label: "Review" },
];

interface Props {
  currentStep: CheckoutStep;
}

const CheckoutSteps = ({ currentStep }: Props) => {
  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm sm:px-6">
      <div className="flex items-center">

        {steps.map((step, index) => {
          const isCompleted = index < stepIndex;
          const isActive = index === stepIndex;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all sm:h-9 sm:w-9 sm:text-sm",
                  isCompleted && "bg-pink-600 text-white",
                  isActive && "bg-pink-600 text-white ring-4 ring-pink-100",
                  !isCompleted && !isActive && "bg-slate-200 text-slate-600"
                )}
              >
                {index + 1}
              </div>

              <span
                className={cn(
                  "ml-2 hidden whitespace-nowrap text-xs font-medium sm:ml-3 sm:block sm:text-sm",
                  isCompleted || isActive
                    ? "text-slate-900"
                    : "text-slate-400"
                )}
              >
                {step.label}
              </span>

              {index < steps.length - 1 && (
                <div className="relative mx-2 h-[3px] flex-1 bg-slate-200 sm:mx-4">

                  <div
                    className={cn(
                      "absolute top-0 left-0 h-full bg-pink-600 transition-all",
                      index < stepIndex ? "w-full" : "w-0"
                    )}
                  />

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default CheckoutSteps;