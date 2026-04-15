"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "@/helper/tokenHelper";
import { apiUrl } from "@/lib/api";
import {
  ALL_ORDER_STATUSES,
  getValidNextOrderStatuses,
  formatStatusLabel,
} from "@/lib/orderStatusFlow";

function normalizeStatus(s: string) {
  return String(s ?? "")
    .trim()
    .toLowerCase();
}

export default function ChangeStatusModal({
  open,
  onClose,
  order,
  onUpdated,
  isSeller,
}: any) {
  const currentStatus = normalizeStatus(order?.orderStatus ?? order?.status ?? "placed");
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(normalizeStatus(order.orderStatus ?? order.status ?? "placed"));
    }
  }, [order]);

  const selectableStatuses = useMemo(() => {
    const next = getValidNextOrderStatuses(currentStatus);
    const combined = [...new Set([currentStatus, ...next])];
    const rank = (s: string) => {
      const i = ALL_ORDER_STATUSES.indexOf(s as (typeof ALL_ORDER_STATUSES)[number]);
      return i === -1 ? 999 : i;
    };
    return combined.sort((a, b) => rank(a) - rank(b));
  }, [currentStatus]);

  if (!open || !order) return null;

  const statusColors: Record<string, string> = {
    placed: "bg-blue-100 text-blue-700",
    confirmed: "bg-indigo-100 text-indigo-700",
    packed: "bg-yellow-100 text-yellow-700",
    shipped: "bg-purple-100 text-purple-700",
    in_transit: "bg-cyan-100 text-cyan-700",
    out_for_delivery: "bg-amber-100 text-amber-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    returned: "bg-orange-100 text-orange-700",
  };

  const handleUpdate = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const path = isSeller
        ? `/api/v1/seller/orders/${order._id}/status`
        : `/api/v1/admin/orders/${order._id}/status`;
      const res = await axios.patch(apiUrl(path), { status }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data?.success && res.data?.data) {
        toast.success("Order status updated successfully!");
        onUpdated({ ...order, ...res.data.data, orderStatus: status, status });
        setTimeout(() => onClose(), 1000);
      } else {
        toast.error(res.data?.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Change Order Status
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Current Status */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Current Status:
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[currentStatus] || "bg-gray-100 text-gray-700"
              }`}
            >
              {formatStatusLabel(currentStatus)}
            </span>
          </div>

          {/* Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(normalizeStatus(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
            >
              {selectableStatuses.map((s) => (
                <option key={s} value={s}>
                  {formatStatusLabel(s)}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              You can move forward in the delivery flow in one step, or cancel while the order is
              not yet shipped.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
