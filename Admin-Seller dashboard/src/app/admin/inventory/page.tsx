"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/helper/tokenHelper";

export default function InventoryPage() {
  const [data, setData] = useState<{ items: any[] }>({ items: [] });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<Record<string, number>>({});

  const fetchInventory = useCallback(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(apiUrl("/api/v1/seller/inventory"), {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      })
      .then((res) => {
        const d = res.data?.data;
        const items = d?.items ?? (Array.isArray(d) ? d : []);
        setData({ items });
        const initial: Record<string, number> = {};
        items.forEach((p: any) => {
          p.variants?.forEach((v: any) => {
            const key = `${p.productId ?? p._id}-${v.variantId}`;
            initial[key] = v.stock ?? 0;
          });
        });
        setEditStock(initial);
      })
      .catch(() => setData({ items: [] }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleSaveStock = async (productId: string, variantId: string, stock: number) => {
    const token = getToken();
    if (!token) return;
    const key = `${productId}-${variantId}`;
    setUpdating(key);
    try {
      const res = await axios.patch(
        apiUrl(`/api/v1/seller/inventory/${productId}/${variantId}`),
        { stock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        toast.success("Stock updated");
        fetchInventory();
      } else {
        toast.error(res.data?.message || "Failed to update stock");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update stock");
    } finally {
      setUpdating(null);
    }
  };

  const handleBulkSave = async () => {
    const token = getToken();
    if (!token) return;
    const updates: { productId: string; variantId: string; stock: number }[] = [];
    data.items.forEach((p: any) => {
      const pid = p.productId ?? p._id;
      p.variants?.forEach((v: any) => {
        const vid = v.variantId;
        const key = `${pid}-${vid}`;
        const newStock = editStock[key];
        if (newStock !== undefined && newStock !== (v.stock ?? 0)) {
          updates.push({ productId: pid, variantId: vid, stock: newStock });
        }
      });
    });
    if (updates.length === 0) {
      toast.info("No changes to save");
      return;
    }
    setUpdating("bulk");
    try {
      const res = await axios.post(
        apiUrl("/api/v1/seller/inventory/bulk"),
        { updates },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        toast.success(`${res.data?.data?.updated?.length ?? updates.length} variant(s) updated`);
        fetchInventory();
      } else {
        toast.error(res.data?.message || "Failed to update");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Bulk update failed");
    } finally {
      setUpdating(null);
    }
  };

  const items = data.items;

  return (
    <div>
      <PageBreadcrumb pageTitle="Inventory" />
      <ComponentCard title="Inventory">
        {loading ? (
          <p className="py-6 text-center text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Variant (SKU)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((p: any) => {
                  const pid = p.productId ?? p._id;
                  const variants = p.variants ?? [];
                  return variants.length > 0 ? (
                    variants.map((v: any, i: number) => {
                      const vid = v.variantId;
                      const key = `${pid}-${vid}`;
                      const currentStock = v.stock ?? 0;
                      const value = editStock[key] ?? currentStock;
                      return (
                        <tr key={key}>
                          {i === 0 && (
                            <td rowSpan={variants.length} className="px-4 py-3 text-gray-900 dark:text-white align-top font-medium">
                              {p.name ?? "—"}
                            </td>
                          )}
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{v.sku ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">₹{v.price ?? 0}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min={0}
                              value={value}
                              onChange={(e) => setEditStock((prev) => ({ ...prev, [key]: Number(e.target.value) || 0 }))}
                              className="w-20 border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleSaveStock(pid, vid, editStock[key] ?? currentStock)}
                              disabled={updating === key || (editStock[key] ?? currentStock) === currentStock}
                              className="px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {updating === key ? "..." : "Save"}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr key={pid}>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{p.name ?? "—"}</td>
                      <td colSpan={4} className="px-4 py-3 text-gray-500 text-sm">No variants</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {items.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleBulkSave}
                  disabled={!!updating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
                >
                  {updating === "bulk" ? "Saving..." : "Save all changes"}
                </button>
              </div>
            )}
            {!loading && items.length === 0 && (
              <p className="py-6 text-center text-gray-500">No inventory data.</p>
            )}
          </div>
        )}
      </ComponentCard>
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
