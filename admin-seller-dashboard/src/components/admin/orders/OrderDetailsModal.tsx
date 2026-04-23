"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { downloadSellerShippingLabel } from "@/lib/sellerShippingLabelDownload";

type OrderDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  order: any;
  isSeller?: boolean;
};

export default function OrderDetailsModal({
  open,
  onClose,
  order,
  isSeller,
}: OrderDetailsModalProps) {
  const [labelDownloading, setLabelDownloading] = useState(false);

  const handleDownloadLabel = () => {
    if (!order?._id) return;
    setLabelDownloading(true);
    void downloadSellerShippingLabel(order._id, order.orderNumber).finally(() =>
      setLabelDownloading(false)
    );
  };

  if (!open || !order) return null;

  const finalPaid = Number(
    order.finalAmountPaid ?? order.grandTotal ?? order.totalAmount ?? 0
  );

  const modal = (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 shrink-0 gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold">Order #{order.orderNumber ?? order._id}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Placed on {new Date(order.createdAt).toLocaleString()}
              {order.updatedAt && (
                <> <br /> Last updated {new Date(order.updatedAt).toLocaleString()}</>
              )}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {isSeller && (
              <button
                type="button"
                onClick={handleDownloadLabel}
                disabled={labelDownloading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-60"
              >
                {labelDownloading ? "Preparing…" : "Download shipping label"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-4 space-y-6">
          {/* Buyer + Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-200">
                Buyer Info
              </h3>
              <p>
                <strong>Name:</strong> {order.buyerId?.name ?? order.userId?.name}
              </p>
              <p>
                <strong>Email:</strong> {order.buyerId?.email ?? order.userId?.email}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {order.deliveryAddress?.phone ??
                  order.shippingAddress?.phone ??
                  "—"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-200">
                Payment Info
              </h3>
              {order.paymentMethod && <p><strong>Method:</strong> {order.paymentMethod}</p>}
              {order.paymentInfo?.gateway && <p><strong>Gateway:</strong> {order.paymentInfo.gateway}</p>}
              {order.paymentInfo?.paymentId && <p><strong>Payment ID:</strong> {order.paymentInfo.paymentId}</p>}
              <p>
                <strong>Payment Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </p>
              <p>
                <strong>Order Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-sm capitalize ${
                    (order.orderStatus ?? order.status) === "delivered"
                      ? "bg-green-100 text-green-700"
                      : (order.orderStatus ?? order.status) === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : order.status === "returned"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.orderStatus ?? order.status}
                </span>
              </p>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Delivery Address
            </h3>
            <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
              <p>
                {order.deliveryAddress?.fullName ??
                  order.shippingAddress?.fullName ??
                  "—"}
              </p>
              <p>
                {order.deliveryAddress?.street ?? order.shippingAddress?.street ?? "—"},{" "}
                {order.deliveryAddress?.city ?? order.shippingAddress?.city ?? "—"},{" "}
                {order.deliveryAddress?.state ?? order.shippingAddress?.state ?? "—"} -{" "}
                {order.deliveryAddress?.pincode ??
                  order.shippingAddress?.postalCode ??
                  order.shippingAddress?.pincode ??
                  "—"}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {order.deliveryAddress?.phone ?? order.shippingAddress?.phone ?? "—"}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Ordered Items
            </h3>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => {
                const name = item.productSnapshot?.name ?? item.name ?? item.productTitle ?? "—";
                const img = item.productSnapshot?.image ?? item.productThumbnail;
                const unitPrice = item.unitPrice ?? item.finalPriceAtPurchase ?? 0;
                const lineTotal = item.lineTotal ?? (item.quantity * unitPrice);
                const sellerName =
                  typeof item.sellerId === "object"
                    ? item.sellerId?.name || item.sellerId?.email || "—"
                    : "—";
                return (
                  <div
                    key={i}
                    className="flex gap-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element -- product URLs come from many CDNs; next/image would error on unknown hosts
                      <img
                        src={img}
                        alt={name}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-xs">
                        No image
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} × ₹{Number(unitPrice).toLocaleString("en-IN")}
                        {item.mrp != null && item.mrp > unitPrice && (
                          <span className="ml-2 text-gray-400 line-through">
                            MRP ₹{Number(item.mrp).toLocaleString("en-IN")}
                          </span>
                        )}
                      </p>
                      {!isSeller && (
                        <p className="text-xs text-gray-500">Seller: {sellerName}</p>
                      )}
                    </div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      ₹{Number(lineTotal).toLocaleString("en-IN")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Summary */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Payment Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/80">
              {order.subtotal != null && (
                <p>
                  <strong>Item subtotal:</strong> ₹
                  {Number(order.subtotal).toLocaleString("en-IN")}
                </p>
              )}
              {order.taxTotal != null && (
                <p>
                  <strong>Tax (GST):</strong> ₹{Number(order.taxTotal).toLocaleString("en-IN")}
                </p>
              )}
              {order.shippingAmount != null && (
                <p>
                  <strong>Shipping:</strong>{" "}
                  {Number(order.shippingAmount) === 0
                    ? "Free"
                    : `₹${Number(order.shippingAmount).toLocaleString("en-IN")}`}
                </p>
              )}
              {order.discountTotal != null && Number(order.discountTotal) > 0 && (
                <p className="text-emerald-700 dark:text-emerald-400">
                  <strong>Discount{order.couponCode ? ` (${order.couponCode})` : ""}:</strong> −₹
                  {Number(order.discountTotal).toLocaleString("en-IN")}
                </p>
              )}
              {(!order.discountTotal || Number(order.discountTotal) === 0) && order.couponCode && (
                <p>
                  <strong>Coupon:</strong> {order.couponCode} (no discount on this order)
                </p>
              )}
              <p className="col-span-1 sm:col-span-2 font-semibold text-base pt-2 border-t border-gray-200 dark:border-gray-600 mt-1">
                <strong>Amount paid (customer):</strong> ₹
                {Number(order.grandTotal ?? finalPaid).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          {/* Refund / Return / Cancel Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <p>
                <strong>Cancel Requested:</strong>{" "}
                {order.cancelRequested ? "Yes" : "No"}
              </p>
              {order.cancelReason && (
                <p>
                  <strong>Reason:</strong> {order.cancelReason}
                </p>
              )}
            </div>
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <p>
                <strong>Refund Status:</strong>{" "}
                <span className="capitalize">{order.refundStatus}</span>
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <p>
                <strong>Return Status:</strong>{" "}
                <span className="capitalize">{order.returnStatus}</span>
              </p>
              {order.returnRequested && (
                <p>
                  <strong>Reason:</strong> {order.returnReason || "—"}
                </p>
              )}
            </div>
          </div>

          {/* Tracking */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tracking Updates
            </h3>
            {Array.isArray(order.trackingUpdates) &&
            order.trackingUpdates.length > 0 ? (
              <div className="space-y-3">
                {order.trackingUpdates?.map((t: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2 border-b last:border-none"
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-600" />
                    <div>
                      <p className="font-medium capitalize">{t.status}</p>
                      {t.note && (
                        <p className="text-xs text-gray-500">{t.note}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(t.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tracking updates yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;
  return createPortal(modal, document.body);
}
