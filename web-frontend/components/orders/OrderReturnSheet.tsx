"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CustomerOrderDetail, OrderLineItemView } from "@/lib/customerOrder";
import {
  getReturnDaysRemaining,
  getReturnWindowEndDate,
  RETURN_WINDOW_DAYS,
} from "@/lib/orderPolicies";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2, PackageX } from "lucide-react";
import { toast } from "sonner";

function lineKey(item: OrderLineItemView, index: number) {
  return `${index}-${item.productId}-${item.variantId ?? ""}`;
}

type Props = {
  order: CustomerOrderDetail;
  /** When set, user already has an open return for this order */
  hasExistingReturn?: boolean;
  onSubmitted?: () => void;
};

export function OrderReturnSheet({ order, hasExistingReturn, onSubmitted }: Props) {
  const [open, setOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("changed_mind");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [qtyByLine, setQtyByLine] = useState<Record<string, number>>({});

  const daysLeft = useMemo(() => getReturnDaysRemaining(order.deliveredAt), [order.deliveredAt]);
  const windowEnd = useMemo(() => getReturnWindowEndDate(order.deliveredAt), [order.deliveredAt]);

  const canRequestReturn =
    order.orderStatus === "delivered" &&
    !!order.deliveredAt &&
    daysLeft !== null &&
    daysLeft >= 0 &&
    !hasExistingReturn;

  const setQty = (key: string, value: number, max: number) => {
    const q = Math.max(0, Math.min(max, Math.floor(value)));
    setQtyByLine((prev) => {
      const next = { ...prev, [key]: q };
      if (q === 0) delete next[key];
      return next;
    });
  };

  const fillReturnAll = () => {
    const next: Record<string, number> = {};
    order.items.forEach((it, idx) => {
      next[lineKey(it, idx)] = it.quantity;
    });
    setQtyByLine(next);
  };

  const clearSelection = () => setQtyByLine({});

  const submitReturn = async () => {
    const items = order.items
      .map((item, idx) => {
        const key = lineKey(item, idx);
        const q = qtyByLine[key] ?? 0;
        if (q <= 0) return null;
        const row: { productId: string; variantId?: string; quantity: number } = {
          productId: item.productId,
          quantity: q,
        };
        if (item.variantId) row.variantId = item.variantId;
        return row;
      })
      .filter(Boolean) as { productId: string; variantId?: string; quantity: number }[];

    if (items.length === 0) {
      toast.error("Select at least one item and quantity to return.");
      return;
    }

    setReturnSubmitting(true);
    try {
      const res = await apiPost("/api/v1/customer/returns", {
        orderId: order.id,
        reason: returnReason,
        description: returnDescription,
        items,
      });
      if (res.success) {
        toast.success("Return request submitted");
        setOpen(false);
        setReturnDescription("");
        clearSelection();
        onSubmitted?.();
      } else {
        toast.error(res.message || "Failed to submit return request");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setReturnSubmitting(false);
    }
  };

  const disabledReason = hasExistingReturn
    ? "You already have a return or exchange request for this order."
    : order.orderStatus !== "delivered"
      ? "Returns are available after delivery."
      : !order.deliveredAt
        ? "Delivery date is not on record yet."
        : daysLeft !== null && daysLeft < 0
          ? `The ${RETURN_WINDOW_DAYS}-day return window has ended.`
          : null;

  const triggerButton = (
    <Button
      type="button"
      variant="outline"
      className="w-full justify-center rounded-lg border-slate-300 dark:border-slate-600"
      disabled={!canRequestReturn}
    >
      <PackageX className="mr-2 h-4 w-4 text-pink-600" />
      Return or exchange
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {canRequestReturn ? <SheetTrigger asChild>{triggerButton}</SheetTrigger> : triggerButton}
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Return or exchange</SheetTitle>
          <SheetDescription>
            Select quantities and a reason.{" "}
            <Link href="/contact" className="font-medium text-pink-600 hover:underline">
              Contact support
            </Link>{" "}
            if you need help.
          </SheetDescription>
        </SheetHeader>

        {canRequestReturn && windowEnd && (
          <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100">
            {daysLeft === 0 ? "Last day" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`} in your
            return window · ends {windowEnd.toLocaleDateString(undefined, { dateStyle: "medium" })}
          </p>
        )}

        {!canRequestReturn && disabledReason && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
            {disabledReason}
          </p>
        )}

        {canRequestReturn && (
          <div className="mt-4 flex flex-1 flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" size="sm" className="rounded-lg" onClick={fillReturnAll}>
                Select all quantities
              </Button>
              <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={clearSelection}>
                Clear
              </Button>
            </div>

            <ul className="space-y-3">
              {order.items.map((item, idx) => {
                const key = lineKey(item, idx);
                return (
                  <li
                    key={key}
                    className="flex flex-col gap-2 rounded-lg border border-slate-100 p-3 dark:border-slate-700"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        SKU {item.sku} · Ordered {item.quantity}
                      </p>
                    </div>
                    <label className="flex items-center justify-between gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span>Return qty</span>
                      <input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={qtyByLine[key] ?? ""}
                        placeholder="0"
                        className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 text-center tabular-nums dark:border-slate-600 dark:bg-slate-900"
                        onChange={(e) => {
                          const v = e.target.value === "" ? 0 : Number(e.target.value);
                          setQty(key, v, item.quantity);
                        }}
                      />
                    </label>
                  </li>
                );
              })}
            </ul>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Reason</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="changed_mind">Changed my mind</option>
                <option value="defective">Defective product</option>
                <option value="wrong_item">Wrong item received</option>
                <option value="not_as_described">Not as described</option>
                <option value="damaged_in_transit">Damaged in transit</option>
                <option value="size_fit_issue">Size/fit issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Textarea
              placeholder="Details (optional)"
              value={returnDescription}
              onChange={(e) => setReturnDescription(e.target.value)}
              rows={3}
              className="rounded-lg"
            />
            <Button
              type="button"
              onClick={submitReturn}
              disabled={returnSubmitting}
              className="rounded-lg bg-red-600 hover:bg-red-700"
            >
              {returnSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit request
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
