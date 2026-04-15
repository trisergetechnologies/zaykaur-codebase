"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "@/helper/tokenHelper";
import { apiUrl } from "@/lib/api";

const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;

export default function PaymentStatusModal({ open, onClose, order, onUpdated }: any) {
  const current = order?.paymentStatus ?? "pending";
  const [paymentStatus, setPaymentStatus] = useState(current);
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setPaymentStatus(order.paymentStatus ?? "pending");
      setPaymentId(order.paymentId ?? order.razorpayPaymentId ?? "");
    }
  }, [order]);

  if (!open || !order) return null;

  const handleUpdate = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const body: { paymentStatus: string; paymentId?: string } = { paymentStatus };
      if (paymentId.trim()) body.paymentId = paymentId.trim();
      const res = await axios.patch(
        apiUrl(`/api/v1/admin/orders/${order._id}/payment`),
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success && res.data?.data) {
        toast.success("Payment status updated");
        onUpdated({ ...order, ...res.data.data, paymentStatus });
        setTimeout(() => onClose(), 800);
      } else {
        toast.error(res.data?.message || "Failed to update payment status");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update payment status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Update Payment Status
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition">✕</button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Order: {order.orderNumber ?? order._id}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment ID (optional)</label>
            <input
              type="text"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              placeholder="e.g. Razorpay payment id"
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Payment"}
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
