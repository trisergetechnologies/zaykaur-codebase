"use client";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { apiPost, apiDelete } from "@/lib/api";
import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";
import { Loader2, X } from "lucide-react";

const CouponCodeForm = () => {
  const [coupon, setCoupon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const fetchCart = useCartStore((s) => s.fetchCart);
  const applied = useCartStore((s) => s.getAppliedCouponCode());
  const discount = useCartStore((s) => s.getCouponDiscount());

  const handleForSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!coupon.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to apply coupons");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiPost<{ discount?: number }>("/api/v1/customer/coupon/apply", {
        code: coupon.trim().toUpperCase(),
      });
      if (res.success) {
        const discountAmount = res.data?.discount ?? 0;
        await fetchCart();
        toast.success(
          discountAmount > 0
            ? `Coupon applied! You save ₹${discountAmount}`
            : "Coupon applied"
        );
        setCoupon("");
      } else {
        toast.error(res.message || "Invalid coupon code");
      }
    } catch {
      toast.error("Failed to apply coupon. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiDelete("/api/v1/customer/coupon/remove");
      if (res.success) {
        await fetchCart();
        toast.success("Coupon removed");
      } else {
        toast.error(res.message || "Could not remove coupon");
      }
    } catch {
      toast.error("Failed to remove coupon");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2 rounded-lg bg-gray-100 p-6 dark:bg-gray-700">
      <form onSubmit={handleForSubmission} className="space-y-2">
        <Label
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
          htmlFor="coupon"
        >
          Coupon code
        </Label>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Discount applies only after a valid code is accepted. Your cart total updates from the
          server.
        </p>
        <Input
          id="coupon"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="e.g. SAVE20"
          className="w-full rounded-md p-6"
        />
        {applied && discount > 0 ? (
          <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            <span className="font-medium">
              {applied}: −₹{discount}
            </span>
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={isSubmitting}
              className="rounded p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900"
              aria-label="Remove coupon"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        <div className="flex items-center justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CouponCodeForm;
