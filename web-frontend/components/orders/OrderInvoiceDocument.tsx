"use client";

import type { CustomerOrderDetail } from "@/lib/customerOrder";
import { formatPaymentMethodLabel, formatPaymentStatusLabel } from "@/lib/customerOrder";
import { formatPrice } from "@/lib/formatPrice";
import { STORE_LEGAL_NAME } from "@/lib/orderPolicies";

type Props = {
  order: CustomerOrderDetail;
};

export function OrderInvoiceDocument({ order }: Props) {
  const issuedAt = order.deliveredAt || order.createdAt;

  return (
    <div className="text-slate-900">
      <header className="border-b border-slate-200 pb-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xl font-bold tracking-tight">{STORE_LEGAL_NAME}</p>
            <p className="mt-1 text-sm text-slate-600">Tax invoice / Bill of supply</p>
          </div>
          <div className="text-right text-sm">
            <p>
              <span className="text-slate-500">Invoice ref:</span>{" "}
              <span className="font-semibold">{order.orderNumber}</span>
            </p>
            <p className="mt-1">
              <span className="text-slate-500">Invoice date:</span>{" "}
              {new Date(issuedAt).toLocaleDateString(undefined, {
                dateStyle: "long",
              })}
            </p>
            <p className="mt-1">
              <span className="text-slate-500">Order placed:</span>{" "}
              {new Date(order.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bill to</p>
          {order.shippingAddress ? (
            <div className="mt-2 text-sm leading-relaxed">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-slate-700">
                {order.shippingAddress.street}
                {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ""}
                {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}
                {order.shippingAddress.postalCode ? ` - ${order.shippingAddress.postalCode}` : ""}
              </p>
              <p className="mt-1 text-slate-600">Phone: {order.shippingAddress.phone}</p>
              {order.shippingAddress.state && (
                <p className="mt-2 text-xs text-slate-500">
                  Place of supply: {order.shippingAddress.state} ({order.currency})
                </p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">—</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment</p>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Method</dt>
              <dd className="font-medium">{formatPaymentMethodLabel(order.paymentMethod)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium">{formatPaymentStatusLabel(order.paymentStatus)}</dd>
            </div>
            {order.paymentId && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Txn ref</dt>
                <dd className="max-w-[60%] truncate font-mono text-xs">{order.paymentId}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-4 font-medium">#</th>
              <th className="py-2 pr-4 font-medium">Item</th>
              <th className="py-2 pr-4 font-medium">SKU</th>
              <th className="py-2 pr-4 text-right font-medium">Qty</th>
              <th className="py-2 pr-4 text-right font-medium">Rate</th>
              <th className="py-2 pr-4 text-right font-medium">Tax</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={`${item.id}-${item.sku}-${i}`} className="border-b border-slate-100">
                <td className="py-3 pr-4 align-top text-slate-500">{i + 1}</td>
                <td className="py-3 pr-4 align-top font-medium">{item.name}</td>
                <td className="py-3 pr-4 align-top font-mono text-xs text-slate-600">{item.sku}</td>
                <td className="py-3 pr-4 align-top text-right tabular-nums">{item.quantity}</td>
                <td className="py-3 pr-4 align-top text-right tabular-nums">
                  ₹{formatPrice(item.unitPrice)}
                </td>
                <td className="py-3 pr-4 align-top text-right tabular-nums text-slate-600">
                  ₹{formatPrice(item.taxAmount)}
                </td>
                <td className="py-3 align-top text-right text-base font-semibold tabular-nums">
                  ₹{formatPrice(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 flex justify-end">
        <dl className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="tabular-nums font-medium">₹{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Tax (GST)</dt>
            <dd className="tabular-nums font-medium">₹{formatPrice(order.taxTotal)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Shipping</dt>
            <dd className="tabular-nums font-medium">
              {order.shippingAmount === 0 ? "Free" : `₹${formatPrice(order.shippingAmount)}`}
            </dd>
          </div>
          {order.discountTotal > 0 && (
            <div className="flex justify-between gap-4 text-emerald-700">
              <dt>
                Discount
                {order.couponCode ? ` (${order.couponCode})` : ""}
              </dt>
              <dd className="tabular-nums font-medium">−₹{formatPrice(order.discountTotal)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-lg font-bold">
            <dt>Grand total</dt>
            <dd className="tabular-nums">₹{formatPrice(order.grandTotal)}</dd>
          </div>
          <p className="pt-1 text-right text-xs text-slate-500">
            Amount in {order.currency} — Rounding as per applicable rules
          </p>
        </dl>
      </div>

      <footer className="mt-10 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
        This is a computer-generated invoice and does not require a signature.
        <br />
        For queries, contact support with order reference {order.orderNumber}.
      </footer>
    </div>
  );
}
