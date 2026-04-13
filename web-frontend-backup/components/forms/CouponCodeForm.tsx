"use client";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";
import { Loader2 } from "lucide-react";

const CouponCodeForm = () => {
  const [coupon, setCoupon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discount, setDiscount] = useState<number | null>(null);
  const { isAuthenticated } = useAuthStore();
  const fetchCart = useCartStore((s) => s.fetchCart);

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
      const res = await apiPost<any>("/api/v1/customer/coupon/apply", {
        code: coupon.trim().toUpperCase(),
      });
      if (res.success) {
        const discountAmount = res.data?.discount ?? res.data?.discountAmount ?? 0;
        setDiscount(discountAmount);
        await fetchCart();
        toast.success(`Coupon applied! You save ₹${discountAmount}`);
      } else {
        toast.error(res.message || "Invalid coupon code");
        setDiscount(null);
      }
    } catch {
      toast.error("Failed to apply coupon. Please try again.");
      setDiscount(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-2 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
      <form onSubmit={handleForSubmission} className="space-y-2">
        <Label
          className="text-xl font-semibold text-gray-900 dark:text-white mb-4"
          htmlFor="coupon"
        >
          Enter Your Coupon Code
        </Label>
        <Input
          id="coupon"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          placeholder="e.g. SAVE20"
          className="w-full p-6 rounded-md"
        />
        {discount !== null && (
          <p className="text-sm text-green-600 font-medium">
            Discount: ₹{discount}
          </p>
        )}
        <div className="flex items-center justify-end">
          <Button disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CouponCodeForm;
