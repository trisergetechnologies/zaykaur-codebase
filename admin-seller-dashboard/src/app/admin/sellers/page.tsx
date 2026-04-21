"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/helper/tokenHelper";

export default function SellersPage() {
  const [data, setData] = useState<{ items: any[]; pagination?: any }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending_approval" | "approved" | "rejected">("pending_approval");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [approveModal, setApproveModal] = useState<{ seller: any } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ seller: any } | null>(null);
  const [detailsModal, setDetailsModal] = useState<{ seller: any } | null>(null);
  const [productsModal, setProductsModal] = useState<{ seller: any } | null>(null);
  const [productsModalData, setProductsModalData] = useState<{ items: any[]; pagination?: any }>({ items: [] });
  const [productsModalLoading, setProductsModalLoading] = useState(false);
  const [productListingActionId, setProductListingActionId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [approveNote, setApproveNote] = useState("");
  const [approveActivate, setApproveActivate] = useState(true);

  const fetchSellers = useCallback(() => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    axios
      .get(apiUrl("/api/v1/admin/sellers"), {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 20, ...(statusFilter === "all" ? {} : { status: statusFilter }) },
      })
      .then((res) => {
        const d = res.data?.data;
        setData({
          items: d?.items ?? (Array.isArray(d) ? d : []),
          pagination: d?.pagination,
        });
      })
      .catch(() => setData({ items: [] }))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const fetchSellerProducts = useCallback((sellerProfileId: string) => {
    const token = getToken();
    if (!token) return;
    setProductsModalLoading(true);
    axios
      .get(apiUrl(`/api/v1/admin/sellers/${sellerProfileId}/products`), {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 100 },
      })
      .then((res) => {
        const d = res.data?.data;
        setProductsModalData({
          items: d?.items ?? [],
          pagination: d?.pagination,
        });
      })
      .catch(() => setProductsModalData({ items: [] }))
      .finally(() => setProductsModalLoading(false));
  }, []);

  useEffect(() => {
    if (productsModal?.seller?._id) {
      fetchSellerProducts(productsModal.seller._id);
    }
  }, [productsModal?.seller?._id, fetchSellerProducts]);

  const productRowId = (p: any) => {
    const id = p?._id ?? p?.id;
    if (id == null) return "";
    return typeof id === "string" ? id : String(id);
  };

  const handleDeactivateListing = async (p: any) => {
    const id = productRowId(p);
    if (!id || !productsModal?.seller?._id) return;
    const token = getToken();
    if (!token) return;
    setProductListingActionId(id);
    try {
      const res = await axios.post(
        apiUrl(`/api/v1/admin/products/${encodeURIComponent(id)}/deactivate`),
        { productId: id },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        toast.success("Product deactivated (hidden from store)");
        fetchSellerProducts(productsModal.seller._id);
      } else {
        toast.error(res.data?.message || "Could not deactivate");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not deactivate");
    } finally {
      setProductListingActionId(null);
    }
  };

  const handleReactivateListing = async (p: any) => {
    const id = productRowId(p);
    if (!id || !productsModal?.seller?._id) return;
    const token = getToken();
    if (!token) return;
    setProductListingActionId(id);
    try {
      const res = await axios.post(
        apiUrl(`/api/v1/admin/products/${encodeURIComponent(id)}/reactivate`),
        { productId: id },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        toast.success("Product reactivated on the store");
        fetchSellerProducts(productsModal.seller._id);
      } else {
        toast.error(res.data?.message || "Could not reactivate");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not reactivate");
    } finally {
      setProductListingActionId(null);
    }
  };

  const handleApprove = async () => {
    if (!approveModal) return;
    const token = getToken();
    if (!token) return;
    setActionLoading("approve");
    try {
      const res = await axios.patch(
        apiUrl(`/api/v1/admin/sellers/${approveModal.seller._id}/approve`),
        { note: approveNote || "Approved by admin", activate: approveActivate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        toast.success("Seller approved successfully");
        setApproveModal(null);
        setApproveNote("");
        setApproveActivate(true);
        fetchSellers();
      } else {
        toast.error(res.data?.message || "Failed to approve");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve seller");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const token = getToken();
    if (!token) return;
    setActionLoading("reject");
    try {
      const res = await axios.patch(
        apiUrl(`/api/v1/admin/sellers/${rejectModal.seller._id}/reject`),
        { note: rejectNote || "Rejected by admin" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        toast.success("Seller rejected");
        setRejectModal(null);
        setRejectNote("");
        fetchSellers();
      } else {
        toast.error(res.data?.message || "Failed to reject");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject seller");
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (seller: any, active: boolean) => {
    const token = getToken();
    if (!token) return;
    setActionLoading(seller._id);
    try {
      const res = await axios.patch(
        apiUrl(`/api/v1/admin/sellers/${seller._id}/activate`),
        { active, note: active ? "Activated by admin" : "Deactivated by admin" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        toast.success(active ? "Seller activated" : "Seller deactivated");
        fetchSellers();
      } else {
        toast.error(res.data?.message || "Failed to update");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update seller");
    } finally {
      setActionLoading(null);
    }
  };

  const items = data.items;

  return (
    <div>
      <PageBreadcrumb pageTitle="Sellers" />
      <ComponentCard title="Sellers">
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            { key: "pending_approval", label: "Pending" },
            { key: "approved", label: "Approved" },
            { key: "rejected", label: "Rejected" },
            { key: "all", label: "All" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as "all" | "pending_approval" | "approved" | "rejected")}
              className={`px-3 py-1.5 text-xs rounded border ${
                statusFilter === tab.key
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {loading ? (
          <p className="py-6 text-center text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Shop</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Onboarding</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((s: any) => (
                  <tr key={s._id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{s.shopName ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {s.userId?.name ?? "—"} ({s.userId?.email ?? "—"})
                    </td>
                    <td className="px-4 py-3">
                      <span className={s.isActive ? "text-green-600" : "text-gray-500"}>
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {s.onboardingStatus ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setDetailsModal({ seller: s })}
                          className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          View details
                        </button>
                        {s.onboardingStatus === "pending_approval" && (
                          <>
                            <button
                              onClick={() => setApproveModal({ seller: s })}
                              disabled={!!actionLoading}
                              className="px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectModal({ seller: s })}
                              disabled={!!actionLoading}
                              className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {s.onboardingStatus === "approved" && (
                          <>
                            <button
                              type="button"
                              onClick={() => setProductsModal({ seller: s })}
                              className="px-2 py-1 text-xs rounded border border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                            >
                              View products
                            </button>
                            <button
                              onClick={() => handleActivate(s, !s.isActive)}
                              disabled={!!actionLoading}
                              className={`px-2 py-1 text-xs rounded text-white disabled:opacity-50 ${s.isActive ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
                            >
                              {actionLoading === s._id ? "..." : s.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && items.length === 0 && (
              <p className="py-6 text-center text-gray-500">No sellers found.</p>
            )}
            {data.pagination && data.pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="py-1">Page {page} of {data.pagination.totalPages}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.pagination.totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </ComponentCard>

      {approveModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setApproveModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Approve seller: {approveModal.seller.shopName}</h3>
            <div className="space-y-3 mb-4">
              <label className="block text-sm font-medium">Note (optional)</label>
              <input
                type="text"
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Approved by admin"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={approveActivate}
                  onChange={(e) => setApproveActivate(e.target.checked)}
                />
                <span className="text-sm">Activate seller after approval</span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setApproveModal(null)}
                className="px-4 py-2 border rounded-lg dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading === "approve"}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === "approve" ? "Approving..." : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailsModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Seller details: {detailsModal.seller.shopName || "—"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">User</p>
                <p className="font-medium">{detailsModal.seller.userId?.name || "—"}</p>
                <p className="text-gray-600 dark:text-gray-400">{detailsModal.seller.userId?.email || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">Onboarding</p>
                <p className="font-medium">{detailsModal.seller.onboardingStatus || "—"}</p>
                <p className={detailsModal.seller.isActive ? "text-green-600" : "text-gray-500"}>
                  {detailsModal.seller.isActive ? "Active" : "Inactive"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Shop slug</p>
                <p className="font-medium">{detailsModal.seller.slug || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">Submitted at</p>
                <p className="font-medium">
                  {detailsModal.seller.submittedAt ? new Date(detailsModal.seller.submittedAt).toLocaleString() : "—"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">GSTIN</p>
                <p className="font-medium">{detailsModal.seller.gstin || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500">PAN</p>
                <p className="font-medium">{detailsModal.seller.pan || "—"}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-500">Bank account details</p>
                <p className="font-medium break-all">{detailsModal.seller.bankAccountDetails || "—"}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-500">Business address</p>
                <p className="font-medium">
                  {[
                    detailsModal.seller.businessAddress?.street,
                    detailsModal.seller.businessAddress?.city,
                    detailsModal.seller.businessAddress?.state,
                    detailsModal.seller.businessAddress?.postalCode,
                    detailsModal.seller.businessAddress?.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-500 mb-2">Documents</p>
                {Array.isArray(detailsModal.seller.documents) && detailsModal.seller.documents.length > 0 ? (
                  <div className="space-y-2">
                    {detailsModal.seller.documents.map((doc: any, index: number) => (
                      <div key={index} className="border rounded-lg px-3 py-2 dark:border-gray-700">
                        <p className="font-medium capitalize">{doc.documentType || "other"}</p>
                        <p className="text-gray-600 dark:text-gray-400">{doc.documentNumber || "No number provided"}</p>
                        {doc.documentUrl ? (
                          <a
                            href={doc.documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:underline break-all"
                          >
                            {doc.documentUrl}
                          </a>
                        ) : (
                          <p className="text-gray-500">No document URL</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No documents provided.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setDetailsModal(null)}
                className="px-4 py-2 border rounded-lg dark:border-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {productsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setProductsModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold mb-2">
              Products — {productsModal.seller.shopName || "Seller"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Seller user: {productsModal.seller.userId?.name ?? "—"} ({productsModal.seller.userId?.email ?? "—"})
            </p>
            <div className="overflow-auto flex-1 min-h-0 border border-gray-200 dark:border-gray-700 rounded-lg">
              {productsModalLoading ? (
                <p className="p-6 text-center text-gray-500">Loading products…</p>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Listing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {productsModalData.items.map((p: any) => {
                      const v0 = p.variants?.[0];
                      const price = v0?.price != null ? `₹${Number(v0.price).toLocaleString("en-IN")}` : "—";
                      const cat =
                        typeof p.category === "object" && p.category
                          ? p.category.name ?? "—"
                          : "—";
                      const st = p.status ?? "";
                      const rowId = productRowId(p);
                      const canDeactivate = st === "active" || st === "out_of_stock";
                      const canReactivate = st === "discontinued";
                      const busy = productListingActionId === rowId;
                      return (
                        <tr key={rowId || p.slug}>
                          <td className="px-3 py-2">
                            <span className="font-medium text-gray-900 dark:text-white">{p.name ?? "—"}</span>
                            {p.slug && (
                              <span className="block text-xs text-gray-500">{p.slug}</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{cat}</td>
                          <td className="px-3 py-2 text-right">{price}</td>
                          <td className="px-3 py-2 capitalize">{st || "—"}</td>
                          <td className="px-3 py-2 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "—"}
                          </td>
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            {canDeactivate && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeactivateListing(p);
                                }}
                                className="px-2 py-1 text-xs rounded bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                              >
                                {busy ? "…" : "Deactivate"}
                              </button>
                            )}
                            {canReactivate && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReactivateListing(p);
                                }}
                                className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {busy ? "…" : "Reactivate"}
                              </button>
                            )}
                            {!canDeactivate && !canReactivate && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              {!productsModalLoading && productsModalData.items.length === 0 && (
                <p className="p-6 text-center text-gray-500">No products for this seller.</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setProductsModal(null)}
                className="px-4 py-2 border rounded-lg dark:border-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRejectModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject seller: {rejectModal.seller.shopName}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Note (optional)</label>
              <input
                type="text"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Rejected by admin"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 border rounded-lg dark:border-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === "reject"}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === "reject" ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
