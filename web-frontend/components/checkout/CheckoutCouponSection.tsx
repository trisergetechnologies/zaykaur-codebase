"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Tag,
  TicketPercent,
  X,
} from "lucide-react";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
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

function offerHeadline(offer: Offer): string {
  if (offer.type === "percent") {
    return `${offer.value}% off`;
  }
  return `₹${offer.value} off`;
}

export default function CheckoutCouponSection() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showAllOffers, setShowAllOffers] = useState(false);
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

  const sortedOffers = useMemo(
    () =>
      [...offers].sort((a, b) => {
        if (a.code === applied) return -1;
        if (b.code === applied) return 1;
        return b.value - a.value;
      }),
    [offers, applied]
  );

  const visibleOffers = showAllOffers ? sortedOffers : sortedOffers.slice(0, 2);

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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <Tag className="h-4 w-4 text-pink-600" />
          <h3 className="text-sm font-semibold text-slate-900">Apply Coupon</h3>
        </div>
        <span className="text-[11px] font-medium text-slate-500">ZayKaur offers</span>
      </div>

      {/* Amazon/Flipkart-style code apply row */}
      <form
        className="rounded-xl border border-slate-300 bg-white p-2"
        onSubmit={(e) => {
          e.preventDefault();
          void apply(code);
        }}
      >
        <div className="flex items-center gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER COUPON CODE"
            className="h-10 flex-1 border-0 bg-transparent font-mono text-sm uppercase tracking-wide shadow-none focus-visible:ring-0"
            disabled={busy}
          />
          <Button
            type="submit"
            disabled={busy}
            className="h-10 min-w-[96px] rounded-lg bg-pink-600 px-5 font-semibold hover:bg-pink-700"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
          </Button>
        </div>
      </form>

      {applied && discount > 0 ? (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              <span className="font-mono font-semibold">{applied}</span>
              <span className="ml-2 font-semibold">Applied: −₹{discount}</span>
            </span>
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

      {/* Flipkart-style available offers block */}
      {sortedOffers.length > 0 ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70">
          <button
            type="button"
            onClick={() => setShowAllOffers((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-2.5 text-left"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Available offers ({sortedOffers.length})
            </span>
            {showAllOffers ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </button>

          <div className="space-y-2 border-t border-slate-200 px-3 py-3">
            {visibleOffers.map((offer) => (
              <div
                key={offer.code}
                className={`rounded-lg border px-3 py-2.5 ${
                  applied === offer.code
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                      <TicketPercent className="mt-0.5 h-4 w-4 shrink-0 text-pink-600" />
                      <span className="shrink-0 font-mono">{offer.code}</span>
                      <span className="text-slate-500">•</span>
                      <span className="truncate">{offerHeadline(offer)}</span>
                    </p>
                    {offer.description ? (
                      <p className="mt-1 text-xs text-slate-600">{offer.description}</p>
                    ) : null}
                    <p className="mt-1 text-[11px] text-slate-500">
                      {offer.minOrderAmount > 0
                        ? `Minimum order ₹${offer.minOrderAmount}`
                        : "No minimum order"}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={busy || applied === offer.code}
                    onClick={() => void apply(offer.code)}
                    className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-pink-300 hover:text-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {applied === offer.code ? "Applied" : "Apply"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {sortedOffers.length > 2 ? (
            <div className="border-t border-slate-200 px-3 py-2">
              <button
                type="button"
                onClick={() => setShowAllOffers((v) => !v)}
                className="text-xs font-semibold text-pink-700 hover:text-pink-800"
              >
                {showAllOffers ? "Show less offers" : `View all ${sortedOffers.length} offers`}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
