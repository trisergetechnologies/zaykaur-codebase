"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/helper/tokenHelper";

function toIdString(id: unknown): string | null {
  if (id == null) return null;
  if (typeof id === "string") {
    const t = id.trim();
    return t.length ? t : null;
  }
  if (typeof id === "object" && id !== null && "$oid" in (id as Record<string, unknown>)) {
    return String((id as { $oid: string }).$oid);
  }
  const s = String(id);
  return s && s !== "[object Object]" ? s : null;
}

function productDocId(doc: { _id?: unknown; id?: unknown } | null | undefined): string | null {
  if (!doc) return null;
  return toIdString(doc._id) ?? toIdString(doc.id);
}

export default function PendingProductsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = useCallback(async (pageNum = 1) => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(apiUrl("/api/v1/admin/products/pending"), {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, limit: 20 },
      });
      const d = res.data?.data;
      const list = d?.items ?? [];
      setItems(list);
      setTotalPages(d?.pagination?.totalPages ?? 1);
      setSelected((prev: any) => {
        if (!prev) return list[0] ?? null;
        const prevId = productDocId(prev);
        const still = list.find((p: any) => productDocId(p) === prevId);
        return still ?? list[0] ?? null;
      });
    } catch (err: unknown) {
      setItems([]);
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
          ? err.message
          : "Failed to load pending products";
      toast.error(typeof msg === "string" ? msg : "Failed to load pending products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending(page);
  }, [fetchPending, page]);

  const handleApprove = async () => {
    const productId = productDocId(selected);
    if (!productId) {
      toast.error("Invalid product — try selecting the row again.");
      return;
    }
    const token = getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      // ID is in the URL path (required). Body includes productId so DevTools Payload shows it; server accepts both.
      const res = await axios.post(
        apiUrl(`/api/v1/admin/products/${encodeURIComponent(productId)}/approve`),
        { productId },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        toast.success("Product approved and published");
        setSelected(null);
        fetchPending(page);
      } else {
        toast.error(res.data?.message || "Failed to approve");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const productId = productDocId(selected);
    if (!productId) {
      toast.error("Invalid product — try selecting the row again.");
      return;
    }
    if (!rejectNote.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    const token = getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await axios.post(
        apiUrl(`/api/v1/admin/products/${encodeURIComponent(productId)}/reject`),
        { productId, note: rejectNote.trim() },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        toast.success("Product rejected");
        setRejectOpen(false);
        setRejectNote("");
        setSelected(null);
        fetchPending(page);
      } else {
        toast.error(res.data?.message || "Failed to reject");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const sellerLabel = (p: any) => {
    const s = p.seller;
    if (typeof s === "object" && s?.name) return `${s.name} (${s.email ?? ""})`;
    return "—";
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Pending product approval" />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <ComponentCard title="Queue" className="xl:col-span-5">
          {loading ? (
            <p className="py-8 text-center text-gray-500">Loading…</p>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No products awaiting approval.</p>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((p, idx) => (
                    <tr
                      key={productDocId(p) ?? `pending-row-${idx}`}
                      onClick={() => setSelected(p)}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                        productDocId(selected) && productDocId(selected) === productDocId(p)
                          ? "bg-indigo-50 dark:bg-indigo-950/30"
                          : ""
                      }`}
                    >
                      <td className="px-3 py-2">
                        <span className="font-medium text-gray-900 dark:text-white">{p.name}</span>
                        {p.slug && (
                          <span className="block text-xs text-gray-500">Listing: {p.slug}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-300 text-xs">{sellerLabel(p)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="py-1 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </ComponentCard>

        <ComponentCard title="Details" className="xl:col-span-7">
          {!selected ? (
            <p className="py-8 text-center text-gray-500">Select a product to review.</p>
          ) : (
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Seller: {sellerLabel(selected)}</p>
                <p className="text-gray-500 dark:text-gray-400">
                  Category:{" "}
                  {typeof selected.category === "object" && selected.category
                    ? selected.category.name
                    : "—"}
                </p>
                <p className="text-gray-500 dark:text-gray-400">Tax: {selected.taxCode ?? "—"}</p>
                <p className="text-gray-500 dark:text-gray-400">Brand: {selected.brand || "—"}</p>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100 mb-1">Description</p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap rounded-lg border border-gray-200 dark:border-gray-700 p-3 max-h-40 overflow-y-auto">
                  {selected.description}
                </p>
              </div>
              {selected.productDetails && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
                  {selected.productDetails.shortDescription && (
                    <p>
                      <span className="font-medium">Short: </span>
                      {selected.productDetails.shortDescription}
                    </p>
                  )}
                  {Array.isArray(selected.productDetails.highlights) && selected.productDetails.highlights.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Highlights</p>
                      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                        {selected.productDetails.highlights.map((h: string, i: number) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(selected.productDetails.specifications) && selected.productDetails.specifications.length > 0 && (
                    <div>
                      <p className="font-medium mb-1">Specifications</p>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selected.productDetails.specifications.map((spec: any, i: number) => (
                          <div key={i} className="flex justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-1">
                            <dt className="text-gray-500">{spec.key}</dt>
                            <dd className="text-gray-900 dark:text-gray-100 text-right">{spec.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100 mb-2">Variants</p>
                <div className="space-y-4">
                  {(selected.variants || []).map((v: any, vi: number) => (
                    <div key={vi} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                      <p className="font-medium">
                        SKU {v.sku} — ₹{v.price} · Stock {v.stock}
                      </p>
                      {v.attributes && Object.keys(v.attributes).length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Object.entries(v.attributes)
                            .map(([k, val]) => `${k}: ${val}`)
                            .join(" · ")}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(v.images || []).map((img: any, ii: number) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={ii}
                            src={img.url}
                            alt={img.alt || `Variant ${vi + 1}`}
                            className="w-20 h-20 object-cover rounded border border-gray-200 dark:border-gray-600"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  Approve & publish
                </button>
                <button
                  type="button"
                  onClick={() => setRejectOpen(true)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </ComponentCard>
      </div>

      {rejectOpen && selected && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRejectOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3">Reject: {selected.name}</h3>
            <label className="block text-sm font-medium mb-1">Reason for seller (required)</label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              placeholder="Explain what needs to change…"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="px-4 py-2 border rounded-lg dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50"
              >
                {actionLoading ? "Rejecting…" : "Reject product"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
