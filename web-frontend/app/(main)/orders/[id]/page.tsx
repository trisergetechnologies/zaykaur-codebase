"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import useOrderStore from "@/store/orderStore";
import useAuthStore from "@/store/authStore";
import { formatPrice } from "@/lib/formatPrice";
import {
  mapCustomerOrderDetail,
  formatPaymentMethodLabel,
  formatPaymentStatusLabel,
  type CustomerOrderDetail,
} from "@/lib/customerOrder";
import { apiGet } from "@/lib/api";
import { InlineProductReview } from "@/components/orders/InlineProductReview";
import { OrderReturnSheet } from "@/components/orders/OrderReturnSheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  CalendarClock,
  Truck,
  ExternalLink,
  FileText,
  Package,
} from "lucide-react";
const PLACEHOLDER = "/placeholder-product.png";

type ReturnRequestBrief = {
  _id: string;
  status: string;
  createdAt?: string;
};

function formatReturnStatus(status: string): string {
  const labels: Record<string, string> = {
    requested: "Request received",
    approved: "Approved",
    pickup_scheduled: "Pickup scheduled",
    picked_up: "Picked up",
    received: "Received at warehouse",
    refund_initiated: "Refund started",
    refund_completed: "Refund completed",
    closed: "Closed",
    rejected: "Rejected",
  };
  return labels[status] ?? status.replace(/_/g, " ");
}

function isActiveReturnStatus(status: string) {
  return !["rejected", "closed"].includes(status);
}

const OrderDetailPage = () => {
  const { id } = useParams();
  const { orders: localOrders } = useOrderStore();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [returnForOrder, setReturnForOrder] = useState<ReturnRequestBrief | null>(null);

  const refreshReturnStatus = useCallback(() => {
    if (!isAuthenticated || !id) return;
    apiGet<{ items: ReturnRequestBrief[] }>(`/api/v1/customer/returns?orderId=${String(id)}&limit=3`)
      .then((res) => {
        if (res.success && res.data?.items?.length) {
          setReturnForOrder(res.data.items[0]);
        } else {
          setReturnForOrder(null);
        }
      })
      .catch(() => setReturnForOrder(null));
  }, [isAuthenticated, id]);

  useEffect(() => {
    if (isAuthenticated && id) {
      apiGet<any>(`/api/v1/customer/order/${id}`)
        .then((res) => {
          if (res.success && res.data) {
            setOrder(mapCustomerOrderDetail(res.data));
          }
        })
        .catch(() => {
          const local = localOrders.find((o) => o.id === id);
          if (local) {
            setOrder(
              mapCustomerOrderDetail({
                _id: local.id,
                orderNumber: local.id,
                createdAt: local.createdAt,
                grandTotal: local.total,
                subtotal: local.total,
                taxTotal: 0,
                shippingAmount: 0,
                discountTotal: 0,
                currency: "INR",
                orderStatus: local.status,
                paymentMethod: local.paymentMethod,
                paymentStatus: "pending",
                shippingAddress: {
                  fullName: local.address.name,
                  phone: local.address.phone,
                  street: local.address.address,
                  city: "",
                  state: "",
                  postalCode: "",
                  country: "India",
                },
                items: local.items.map((it) => ({
                  productId: it.id,
                  name: it.name,
                  sku: "—",
                  quantity: it.quantity,
                  unitPrice: it.price,
                  taxRate: 0,
                  taxAmount: 0,
                  lineTotal: it.price * it.quantity,
                  productSnapshot: { image: it.image },
                })),
                shipments: [],
              })
            );
          }
        })
        .finally(() => setLoading(false));
    } else {
      const local = localOrders.find((o) => o.id === id);
      if (local) {
        setOrder(
          mapCustomerOrderDetail({
            _id: local.id,
            orderNumber: local.id,
            createdAt: local.createdAt,
            grandTotal: local.total,
            subtotal: local.total,
            taxTotal: 0,
            shippingAmount: 0,
            discountTotal: 0,
            currency: "INR",
            orderStatus: local.status,
            paymentMethod: local.paymentMethod,
            paymentStatus: "pending",
            shippingAddress: {
              fullName: local.address.name,
              phone: local.address.phone,
              street: local.address.address,
              city: "",
              state: "",
              postalCode: "",
              country: "India",
            },
            items: local.items.map((it) => ({
              productId: it.id,
              name: it.name,
              sku: "—",
              quantity: it.quantity,
              unitPrice: it.price,
              taxRate: 0,
              taxAmount: 0,
              lineTotal: it.price * it.quantity,
              productSnapshot: { image: it.image },
            })),
            shipments: [],
          })
        );
      }
      setLoading(false);
    }
  }, [id, isAuthenticated, localOrders]);

  useEffect(() => {
    refreshReturnStatus();
  }, [refreshReturnStatus]);

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-50/60 pb-12 pt-8 dark:bg-slate-950/40">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-9 w-40 rounded-lg" />
          <Skeleton className="mb-6 h-32 w-full rounded-2xl" />
          <div className="grid gap-6 lg:grid-cols-12">
            <Skeleton className="h-96 rounded-2xl lg:col-span-8" />
            <Skeleton className="h-80 rounded-2xl lg:col-span-4" />
          </div>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="min-h-screen bg-slate-50/60 px-4 pb-12 pt-16 text-center dark:bg-slate-950/40">
        <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Order not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          This order may have been removed or the link is incorrect.
        </p>
        <Button asChild className="mt-6 rounded-lg">
          <Link href="/orders">Back to orders</Link>
        </Button>
      </section>
    );
  }

  const isDelivered = order.orderStatus === "delivered";
  const hasOpenReturn = !!(returnForOrder && isActiveReturnStatus(returnForOrder.status));

  const dateRow = (label: string, value?: string) =>
    value ? (
      <div className="flex justify-between gap-4 text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="text-right font-medium text-slate-800 dark:text-slate-200">
          {new Date(value).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </div>
    ) : null;

  return (
    <section className="min-h-screen bg-slate-50/60 pb-12 pt-8 dark:bg-slate-950/40">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-pink-600 hover:text-pink-700 dark:text-pink-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
                {order.orderNumber}
              </h1>
              <OrderStatusBadge status={order.orderStatus} />
              {returnForOrder && (
                <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
                  Return / exchange requested · {formatReturnStatus(returnForOrder.status)}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Ordered on{" "}
              {new Date(order.createdAt).toLocaleString(undefined, {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            {isDelivered && isAuthenticated && (
              <Button
                asChild
                variant="outline"
                className="rounded-lg border-slate-300 dark:border-slate-600"
              >
                <Link href={`/orders/${order.id}/invoice`}>
                  <FileText className="mr-2 h-4 w-4" />
                  View invoice
                </Link>
              </Button>
            )}
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-xs text-slate-500">Total paid</p>
              <p className="text-xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
                ₹{formatPrice(order.grandTotal)}
              </p>
              <p className="text-[11px] text-slate-400">{order.currency}</p>
            </div>
          </div>
        </header>

        <OrderTimeline status={order.orderStatus} className="mb-6" />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            {/* Items */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
              <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-700 sm:px-5">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Items ({order.items.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Prices and taxes are locked from when you placed this order.
                </p>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-700">
                {order.items.map((item, idx) => (
                  <li key={`${item.id}-${item.sku}-${idx}`} className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800">
                        <Image
                          src={item.image || PLACEHOLDER}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        {item.productId ? (
                          <Link
                            href={`/shop/product/${item.productId}`}
                            className="font-medium leading-snug text-slate-900 hover:text-pink-600 dark:text-slate-100 dark:hover:text-pink-400"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <p className="font-medium leading-snug text-slate-900 dark:text-slate-100">
                            {item.name}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                          SKU: {item.sku}
                          {item.variantId
                            ? ` · Variant: ${String(item.variantId).slice(-6)}`
                            : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                          <span>
                            ₹{formatPrice(item.unitPrice)} × {item.quantity}
                            {item.mrp != null && item.mrp > item.unitPrice && (
                              <span className="ml-2 text-slate-400 line-through">
                                MRP ₹{formatPrice(item.mrp)}
                              </span>
                            )}
                          </span>
                          <span className="text-slate-400">|</span>
                          <span>Tax ({item.taxRate}%): ₹{formatPrice(item.taxAmount)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 sm:items-end">
                      <p className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
                        ₹{formatPrice(item.lineTotal)}
                      </p>
                    </div>
                    </div>
                    {isAuthenticated && isDelivered && (
                      <InlineProductReview
                        productId={item.productId}
                        orderId={order.id}
                        enabled={isDelivered && isAuthenticated}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Shipments */}
            {order.shipments.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-pink-600" />
                  <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    Shipments
                  </h2>
                </div>
                <div className="space-y-4">
                  {order.shipments.map((sh) => (
                    <div
                      key={sh.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <OrderStatusBadge status={sh.status} />
                        {sh.trackingUrl && (
                          <a
                            href={sh.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-pink-600 hover:underline"
                          >
                            Track on carrier
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="mt-3 grid gap-1 text-sm text-slate-700 dark:text-slate-300">
                        {sh.carrierName && (
                          <p>
                            <span className="text-slate-500">Carrier:</span> {sh.carrierName}{" "}
                            {sh.carrierCode ? `(${sh.carrierCode})` : ""}
                          </p>
                        )}
                        {sh.awbNumber && (
                          <p>
                            <span className="text-slate-500">AWB:</span>{" "}
                            <span className="font-mono">{sh.awbNumber}</span>
                          </p>
                        )}
                      </div>
                      {sh.events.length > 0 && (
                        <ul className="mt-3 space-y-2 border-t border-slate-200 pt-3 dark:border-slate-600">
                          {sh.events.map((ev, i) => (
                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400">
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {new Date(ev.at).toLocaleString()}
                              </span>
                              {ev.description ? ` — ${ev.description}` : ""}
                              {ev.location ? ` · ${ev.location}` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Order total</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums font-medium text-slate-900 dark:text-slate-100">
                    ₹{formatPrice(order.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                  <dt>Tax</dt>
                  <dd className="tabular-nums font-medium text-slate-900 dark:text-slate-100">
                    ₹{formatPrice(order.taxTotal)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-300">
                  <dt>Shipping</dt>
                  <dd className="tabular-nums font-medium text-slate-900 dark:text-slate-100">
                    {order.shippingAmount === 0 ? "Free" : `₹${formatPrice(order.shippingAmount)}`}
                  </dd>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between gap-4 text-emerald-700 dark:text-emerald-400">
                    <dt>
                      Discount
                      {order.couponCode ? ` (${order.couponCode})` : ""}
                    </dt>
                    <dd className="tabular-nums font-medium">−₹{formatPrice(order.discountTotal)}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 flex justify-between border-t border-slate-200 pt-4 text-base font-bold dark:border-slate-700">
                <span className="text-slate-900 dark:text-slate-50">Grand total</span>
                <span className="tabular-nums text-slate-900 dark:text-slate-50">
                  ₹{formatPrice(order.grandTotal)}
                </span>
              </div>
            </div>

            {isAuthenticated && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Returns</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Return or exchange lives here so your items stay the focus.
                </p>
                {returnForOrder && (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100">
                    Return / exchange requested — {formatReturnStatus(returnForOrder.status)}
                  </p>
                )}
                <div className="mt-4">
                  <OrderReturnSheet
                    order={order}
                    hasExistingReturn={hasOpenReturn}
                    onSubmitted={refreshReturnStatus}
                  />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
              <div className="mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-pink-600" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Payment</h2>
              </div>
              <dl className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Method</dt>
                  <dd className="text-right font-medium text-slate-900 dark:text-slate-100">
                    {formatPaymentMethodLabel(order.paymentMethod)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Status</dt>
                  <dd className="text-right font-medium text-slate-900 dark:text-slate-100">
                    {formatPaymentStatusLabel(order.paymentStatus)}
                  </dd>
                </div>
                {order.paymentId && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Reference</dt>
                    <dd className="max-w-[60%] truncate text-right font-mono text-xs">{order.paymentId}</dd>
                  </div>
                )}
              </dl>
            </div>

            {order.shippingAddress && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-pink-600" />
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Delivery address
                  </h2>
                </div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {order.shippingAddress.fullName}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {order.shippingAddress.street}
                  {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ""}
                  {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}
                  {order.shippingAddress.postalCode ? ` - ${order.shippingAddress.postalCode}` : ""}
                  {order.shippingAddress.country ? `, ${order.shippingAddress.country}` : ""}
                </p>
                <p className="mt-2 text-sm text-slate-500">Phone: {order.shippingAddress.phone}</p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
              <div className="mb-3 flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-pink-600" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Timeline</h2>
              </div>
              <div className="space-y-2">
                {dateRow("Ordered", order.createdAt)}
                {dateRow("Confirmed", order.confirmedAt)}
                {dateRow("Shipped", order.shippedAt)}
                {dateRow("Delivered", order.deliveredAt)}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default OrderDetailPage;
