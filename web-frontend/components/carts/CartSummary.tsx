"use client";

import useCartStore from "@/store/cartStore";
import useAuthStore from "@/store/authStore";
import { formatPrice } from "@/lib/formatPrice";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import CheckoutCouponSection from "@/components/checkout/CheckoutCouponSection";

const CartSummary = () => {

  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const {
    getTotalPrice,
    getTax,
    getShippingFee,
    getTotalAmount,
    getCouponDiscount,
  } = useCartStore();

  const subtotal = getTotalPrice();
  const tax = getTax();
  const shipping = getShippingFee();
  const couponOff = getCouponDiscount();
  const total = getTotalAmount();

  return (
    <aside className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-5">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Price Details</h2>
          <p className="mt-1 text-xs text-slate-500">
            Safe and secure checkout with transparent pricing
          </p>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">₹{formatPrice(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-medium text-slate-900">
              {shipping === 0 ? "Free" : `₹${formatPrice(shipping)}`}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Tax</span>
            <span className="font-medium text-slate-900">₹{formatPrice(tax)}</span>
          </div>

          {couponOff > 0 ? (
            <div className="flex justify-between text-emerald-700">
              <span>Coupon</span>
              <span className="font-medium">−₹{formatPrice(couponOff)}</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>₹{formatPrice(total)}</span>
        </div>

        {isAuthenticated ? (
          <div className="border-t border-slate-200 pt-4">
            <CheckoutCouponSection />
          </div>
        ) : null}

        <Button
          onClick={() => {
            if (!isAuthenticated) {
              router.push(`/sign-in?redirect=${encodeURIComponent("/checkout")}`);
              return;
            }
            router.push("/checkout");
          }}
          className="h-11 w-full rounded-lg bg-pink-600 text-sm font-semibold uppercase tracking-wide hover:bg-pink-700"
        >
          Continue to Checkout
        </Button>

        <div className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
          By continuing, you agree to ZayKaur terms and secure payment policies.
        </div>
      </div>
    </aside>
  );
};

export default CartSummary;