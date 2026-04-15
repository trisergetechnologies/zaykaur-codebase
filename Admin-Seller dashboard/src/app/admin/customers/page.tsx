"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/helper/tokenHelper";

export default function CustomersPage() {
  const [data, setData] = useState<{ items: any[]; pagination?: any }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchCustomers = useCallback(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(apiUrl("/api/v1/admin/customers"), {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 20 },
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
  }, [page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleBlock = async (customerId: string, block: boolean) => {
    const token = getToken();
    if (!token) return;
    setActionLoading(customerId);
    try {
      const res = await axios.patch(
        apiUrl(`/api/v1/admin/customers/${customerId}/block`),
        { block },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        toast.success(block ? "Customer blocked" : "Customer unblocked");
        setData((prev) => ({
          ...prev,
          items: prev.items.map((c: any) =>
            c._id === customerId ? { ...c, isBlocked: block } : c
          ),
        }));
      } else {
        toast.error(res.data?.message || "Failed to update");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update customer");
    } finally {
      setActionLoading(null);
    }
  };

  const items = data.items;

  return (
    <div>
      <PageBreadcrumb pageTitle="Customers" />
      <ComponentCard title="Customers">
        {loading ? (
          <p className="py-6 text-center text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((c: any) => (
                  <tr key={c._id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{c.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.email ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={c.isBlocked ? "text-red-600 font-medium" : "text-green-600"}>
                        {c.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleBlock(c._id, !c.isBlocked)}
                        disabled={!!actionLoading}
                        className={`px-2 py-1 text-xs rounded text-white disabled:opacity-50 ${c.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                      >
                        {actionLoading === c._id ? "..." : c.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && items.length === 0 && (
              <p className="py-6 text-center text-gray-500">No customers found.</p>
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
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
