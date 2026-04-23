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
import Image from "next/image";

const ADMIN_OVERRIDE_STATUSES = ["requested", "approved", "rejected", "pickup_scheduled", "picked_up", "received", "refund_initiated", "refund_completed", "closed"];
const SELLER_STATUSES = ["approved", "rejected", "pickup_scheduled", "picked_up", "received", "refund_initiated", "refund_completed", "closed"];

type ReturnItem = {
  productId?: string;
  name?: string;
  sku?: string;
  image?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
};

type ReturnRow = {
  _id: string;
  orderId?: string | { _id?: string; orderNumber?: string };
  userId?: string | { _id?: string; name?: string; email?: string; phone?: string };
  sellerId?: string | { _id?: string; name?: string; email?: string; phone?: string };
  reason?: string;
  description?: string;
  status: string;
  refundAmount?: number;
  createdAt?: string;
  items?: ReturnItem[];
  sellerNote?: string;
  adminNote?: string;
};

function getId(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "_id" in v) return String((v as { _id?: string })._id || "");
  return "";
}

function getName(v: unknown): string {
  if (v && typeof v === "object" && "name" in v) return String((v as { name?: string }).name || "");
  return "";
}

function getEmail(v: unknown): string {
  if (v && typeof v === "object" && "email" in v) return String((v as { email?: string }).email || "");
  return "";
}

function getOrderNo(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "orderNumber" in v) return String((v as { orderNumber?: string }).orderNumber || "");
  return "";
}

export default function ReturnsPage() {
  const [data, setData] = useState<{ items: ReturnRow[] }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isSeller = user?.role === "seller";
  const path = isSeller ? "/api/v1/seller/returns" : "/api/v1/admin/returns";
  const [overrideModal, setOverrideModal] = useState<ReturnRow | null>(null);
  const [sellerStatusModal, setSellerStatusModal] = useState<ReturnRow | null>(null);
  const [detailModal, setDetailModal] = useState<ReturnRow | null>(null);
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
                  {!isSeller && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>}
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Refund</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {returns.map((r) => (
                  <tr key={r._id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      <div className="font-semibold">{getOrderNo(r.orderId) || getId(r.orderId) || "—"}</div>
                      <div className="text-xs text-gray-500">{getId(r.orderId)}</div>
                    </td>
                    {!isSeller && (
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                        <div>{getName(r.userId) || "—"}</div>
                        <div className="text-xs text-gray-500">{getEmail(r.userId)}</div>
                      </td>
                    )}
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-200">
                      <div>{getName(r.sellerId) || "—"}</div>
                      <div className="text-xs text-gray-500">{getEmail(r.sellerId)}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.reason || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.status ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">₹{r.refundAmount ?? 0}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setDetailModal(r)}
                          className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                          View
                        </button>
                        {!isSeller && (
                          <button
                            onClick={() => {
                              setOverrideModal(r);
                              setOverrideStatus(r.status || "approved");
                              setOverrideNote("");
                              setOverrideRefund(String(r.refundAmount ?? ""));
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
                      </div>
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
            <h3 className="text-lg font-semibold mb-4">Override return (Order: {getOrderNo(overrideModal.orderId) || getId(overrideModal.orderId)})</h3>
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

      {detailModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-1">Return request details</h3>
            <p className="text-sm text-gray-500 mb-4">
              Order: {getOrderNo(detailModal.orderId) || getId(detailModal.orderId) || "—"} · Status:{" "}
              <span className="font-medium text-gray-900 dark:text-white">{detailModal.status}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-xs text-gray-500 uppercase">Customer</p>
                <p className="font-medium">{getName(detailModal.userId) || "—"}</p>
                <p className="text-sm text-gray-500">{getEmail(detailModal.userId)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <p className="text-xs text-gray-500 uppercase">Seller</p>
                <p className="font-medium">{getName(detailModal.sellerId) || "—"}</p>
                <p className="text-sm text-gray-500">{getEmail(detailModal.sellerId)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
                <p className="font-medium">Returned items</p>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {(detailModal.items || []).map((item, idx) => (
                  <div key={`${item.productId || "item"}-${idx}`} className="p-4 flex items-start gap-3">
                    <div className="relative w-14 h-14 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                      {item.image ? (
                        <Image src={item.image} alt={item.name || "item"} fill className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{item.name || "Item"}</p>
                      <p className="text-xs text-gray-500">SKU: {item.sku || "—"}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity || 0} · Unit: ₹{item.unitPrice || 0} · Line: ₹{item.lineTotal ?? (item.unitPrice || 0) * (item.quantity || 0)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!detailModal.items || detailModal.items.length === 0) && (
                  <p className="p-4 text-sm text-gray-500">No item details captured.</p>
                )}
              </div>
            </div>

            {(detailModal.description || detailModal.adminNote || detailModal.sellerNote) && (
              <div className="mt-4 space-y-2 text-sm">
                {detailModal.description && (
                  <p><span className="font-medium">Customer note:</span> {detailModal.description}</p>
                )}
                {detailModal.sellerNote && (
                  <p><span className="font-medium">Seller note:</span> {detailModal.sellerNote}</p>
                )}
                {detailModal.adminNote && (
                  <p><span className="font-medium">Admin note:</span> {detailModal.adminNote}</p>
                )}
              </div>
            )}

            <div className="flex justify-end mt-5">
              <button onClick={() => setDetailModal(null)} className="px-4 py-2 border rounded-lg dark:border-gray-600">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
