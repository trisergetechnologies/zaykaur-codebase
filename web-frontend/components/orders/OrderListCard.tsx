"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import type { CustomerOrderListItem } from "@/lib/customerOrder";
import { formatPaymentMethodLabel } from "@/lib/customerOrder";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

type Props = {
  order: CustomerOrderListItem;
};

const FALLBACK_IMG = "/placeholder-product.png";

export function OrderListCard({ order }: Props) {
  const thumbs =
    order.previewImages.length > 0
      ? order.previewImages
      : [FALLBACK_IMG];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-pink-200/80 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/40">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {order.orderNumber}
            </h2>
            <OrderStatusBadge status={order.orderStatus} />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium dark:bg-slate-800">
              <Package className="h-3.5 w-3.5" aria-hidden />
              {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
            </span>
            <span className="text-slate-400">·</span>
            <span>{formatPaymentMethodLabel(order.paymentMethod)}</span>
            <span className="text-slate-400">·</span>
            <span className="capitalize">Payment: {order.paymentStatus}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-3 sm:items-end">
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Order total</p>
            <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-50">
              ₹{formatPrice(order.grandTotal)}
            </p>
            <p className="text-[11px] text-slate-400">Incl. taxes &amp; charges</p>
          </div>
          <Link href={`/orders/${order.id}`} className="sm:self-end">
            <Button
              variant="outline"
              className="w-full gap-2 rounded-lg border-slate-300 sm:w-auto dark:border-slate-600"
            >
              View details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-700 sm:px-5">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Items in this order
        </p>
        <div className="flex flex-wrap gap-2">
          {thumbs.slice(0, 5).map((src, i) => (
            <div
              key={`${order.id}-img-${i}`}
              className="relative h-14 w-14 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800"
            >
              <Image
                src={src || FALLBACK_IMG}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          ))}
          {order.items.length > 5 && (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-slate-200 text-xs font-semibold text-slate-500 dark:border-slate-600">
              +{order.items.length - 5}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
