"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/helper/tokenHelper";
import { useAuth } from "@/context/AuthContext";

const ADMIN_OVERRIDE_STATUSES = ["requested", "approved", "rejected", "pickup_scheduled", "picked_up", "received", "refund_initiated", "refund_completed", "closed"];
const SELLER_STATUSES = ["approved", "rejected", "pickup_scheduled", "picked_up", "received", "refund_initiated", "refund_completed", "closed"];

export default function ReturnsPage() {
  const [data, setData] = useState<{ items: any[] }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isSeller = user?.role === "seller";
  const path = isSeller ? "/api/v1/seller/returns" : "/api/v1/admin/returns";
  const [overrideModal, setOverrideModal] = useState<any | null>(null);
  const [sellerStatusModal, setSellerStatusModal] = useState<any | null>(null);
  const [overrideStatus, setOverrideStatus] = useState("approved");
  const [overrideNote, setOverrideNote] = useState("");
  const [overrideRefund, setOverrideRefund] = useState("");
  const [sellerStatus, setSellerStatus] = useState("approved");
  const [sellerNote, setSellerNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReturns = useCallback(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(apiUrl(path), {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 },
      })
      .then((res) => {
        const d = res.data?.data;
        const items = d?.items ?? (Array.isArray(d) ? d : []);
        setData({ items });
      })
      .catch(() => setData({ items: [] }))
      .finally(() => setLoading(false));
  }, [path]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  const handleAdminOverride = async () => {
    if (!overrideModal) return;
    const token = getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      const body: { status: string; adminNote?: string; refundAmount?: number } = { status: overrideStatus };
      if (overrideNote.trim()) body.adminNote = overrideNote.trim();
      if (overrideRefund.trim() && !Number.isNaN(Number(overrideRefund))) body.refundAmount = Number(overrideRefund);
      const res = await axios.patch(
        apiUrl(`/api/v1/admin/returns/${overrideModal._id}/override`),
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        toast.success("Return status updated");
        setOverrideModal(null);
        setOverrideNote("");
        setOverrideRefund("");
        fetchReturns();
      } else {
        toast.error(res.data?.message || "Failed to update");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update return");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSellerStatus = async () => {
    if (!sellerStatusModal) return;
    const token = getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(
        apiUrl(`/api/v1/seller/returns/${sellerStatusModal._id}/status`),
        { status: sellerStatus, sellerNote: sellerNote.trim() || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        toast.success("Return status updated");
        setSellerStatusModal(null);
        setSellerNote("");
        fetchReturns();
      } else {
        toast.error(res.data?.message || "Failed to update");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update return");
    } finally {
      setActionLoading(false);
    }
  };

  const returns = data.items;

  return (
    <div>
      <PageBreadcrumb pageTitle="Returns" />
      <ComponentCard title={isSeller ? "My Return Requests" : "Return Requests"}>
        {loading ? (
          <p className="py-6 text-center text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Refund</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {returns.map((r: any) => (
                  <tr key={r._id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {typeof r.orderId === "object" ? r.orderId?.orderNumber ?? r.orderId?._id : r.orderId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.status ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">₹{r.refundAmount ?? 0}</td>
                    <td className="px-4 py-3">
                        {!isSeller && (
                          <button
                            onClick={() => {
                              setOverrideModal(r);
                              setOverrideStatus(r.status || "approved");
                              setOverrideNote("");
                              setOverrideRefund(r.refundAmount ?? "");
                            }}
                            className="px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
                          >
                            Override
                          </button>
                        )}
                        {isSeller && (r.status === "requested" || SELLER_STATUSES.includes(r.status)) && (
                          <button
                            onClick={() => {
                              setSellerStatusModal(r);
                              setSellerStatus(r.status === "requested" ? "approved" : r.status);
                              setSellerNote("");
                            }}
                            className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
                          >
                            Update
                          </button>
                        )}
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && returns.length === 0 && (
              <p className="py-6 text-center text-gray-500">No return requests.</p>
            )}
          </div>
        )}
      </ComponentCard>

      {overrideModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOverrideModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Override return (Order: {typeof overrideModal.orderId === "object" ? overrideModal.orderId?.orderNumber : overrideModal.orderId})</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                >
                  {ADMIN_OVERRIDE_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin note (optional)</label>
                <input
                  type="text"
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Refund amount (optional)</label>
                <input
                  type="number"
                  value={overrideRefund}
                  onChange={(e) => setOverrideRefund(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                  min={0}
                  step={0.01}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setOverrideModal(null)} className="px-4 py-2 border rounded-lg dark:border-gray-600">Cancel</button>
              <button onClick={handleAdminOverride} disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {actionLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sellerStatusModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSellerStatusModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Update return status</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={sellerStatus}
                  onChange={(e) => setSellerStatus(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                >
                  {SELLER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note (optional)</label>
                <input
                  type="text"
                  value={sellerNote}
                  onChange={(e) => setSellerNote(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setSellerStatusModal(null)} className="px-4 py-2 border rounded-lg dark:border-gray-600">Cancel</button>
              <button onClick={handleSellerStatus} disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                {actionLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
