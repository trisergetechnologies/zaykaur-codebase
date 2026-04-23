"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Tag, X } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";
import useCartStore from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Offer = {
  code: string;
  description: string;
  type: string;
  value: number;
  minOrderAmount: number;
  audience: string;
};

export default function CheckoutCouponSection() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const applied = useCartStore((s) => s.getAppliedCouponCode());
  const discount = useCartStore((s) => s.getCouponDiscount());

  const loadOffers = useCallback(async () => {
    const res = await apiGet<Offer[]>("/api/v1/customer/coupon/checkout-offers");
    if (res.success && Array.isArray(res.data)) setOffers(res.data);
    else setOffers([]);
  }, []);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  const apply = async (c: string) => {
    const trimmed = c.trim().toUpperCase();
    if (!trimmed) {
      toast.error("Enter a coupon code");
      return;
    }
    setBusy(true);
    try {
      const res = await apiPost<{ discount?: number }>("/api/v1/customer/coupon/apply", {
        code: trimmed,
      });
      if (res.success) {
        toast.success(res.message || "Coupon applied");
        setCode("");
        await fetchCart();
        await loadOffers();
      } else {
        toast.error(res.message || "Could not apply coupon");
      }
    } catch {
      toast.error("Could not apply coupon");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      const res = await apiDelete("/api/v1/customer/coupon/remove");
      if (res.success) {
        toast.success("Coupon removed");
        await fetchCart();
      } else {
        toast.error(res.message || "Could not remove coupon");
      }
    } catch {
      toast.error("Could not remove coupon");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Tag className="h-4 w-4 text-pink-600" aria-hidden />
        <h3 className="text-sm font-semibold text-slate-900">Coupons</h3>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        Discounts apply only after you enter a valid code or use an offer below. Nothing is deducted
        automatically.
      </p>

      {offers.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Available for you
          </p>
          <div className="flex flex-wrap gap-2">
            {offers.map((o) => (
              <button
                key={o.code}
                type="button"
                disabled={busy}
                onClick={() => void apply(o.code)}
                className="rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-left text-xs transition hover:border-pink-400 hover:bg-pink-100 disabled:opacity-50"
              >
                <span className="font-mono font-semibold text-pink-800">{o.code}</span>
                {o.description ? (
                  <span className="mt-0.5 block text-[11px] text-slate-600">{o.description}</span>
                ) : null}
                {o.minOrderAmount > 0 ? (
                  <span className="mt-0.5 block text-[10px] text-slate-500">
                    Min order ₹{o.minOrderAmount}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          void apply(code);
        }}
      >
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="h-10 flex-1 font-mono text-sm uppercase"
          disabled={busy}
        />
        <Button type="submit" disabled={busy} className="h-10 shrink-0 bg-pink-600 hover:bg-pink-700">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </Button>
      </form>

      {applied && discount > 0 ? (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          <span>
            <span className="font-mono font-semibold">{applied}</span>
            <span className="ml-2">−₹{discount}</span>
          </span>
          <button
            type="button"
            onClick={() => void remove()}
            disabled={busy}
            className="rounded p-1 text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
            aria-label="Remove coupon"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
