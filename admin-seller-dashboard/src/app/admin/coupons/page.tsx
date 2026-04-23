"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/helper/tokenHelper";

function toDateInput(d: string | Date | undefined) {
  if (!d) return "";
  const x = new Date(d);
  return x.toISOString().slice(0, 16);
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percent" as "percent" | "flat",
    value: "",
    description: "",
    validFrom: "",
    validTo: "",
    minOrderAmount: "",
    maxDiscount: "",
    usageLimit: "",
    perUserLimit: "1",
    isActive: true,
    showOnCheckout: false,
    audience: "all" as "all" | "new_users",
  });

  const fetchCoupons = useCallback(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(apiUrl("/api/v1/admin/coupons"), {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      })
      .then((res) => {
        const d = res.data?.data;
        setCoupons(Array.isArray(d) ? d : d?.items ?? []);
      })
      .catch(() => setCoupons([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const resetForm = () => {
    setForm({
      code: "",
      type: "percent",
      value: "",
      description: "",
      validFrom: "",
      validTo: "",
      minOrderAmount: "",
      maxDiscount: "",
      usageLimit: "",
      perUserLimit: "1",
      isActive: true,
      showOnCheckout: false,
      audience: "all",
    });
    setEditCoupon(null);
    setCreateOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    const value = Number(form.value);
    if (Number.isNaN(value) || value < 0) {
      toast.error("Value must be a non-negative number");
      return;
    }
    const validFrom = form.validFrom ? new Date(form.validFrom) : null;
    const validTo = form.validTo ? new Date(form.validTo) : null;
    if (!validFrom || !validTo) {
      toast.error("Valid from and Valid to are required");
      return;
    }
    if (!form.code.trim()) {
      toast.error("Code is required");
      return;
    }
    setActionLoading(true);
    try {
      const body: any = {
        code: form.code.trim(),
        type: form.type,
        value,
        validFrom,
        validTo,
        description: form.description.trim() || undefined,
        isActive: form.isActive,
        showOnCheckout: form.showOnCheckout,
        audience: form.audience,
      };
      if (form.minOrderAmount.trim() && !Number.isNaN(Number(form.minOrderAmount))) body.minOrderAmount = Number(form.minOrderAmount);
      if (form.maxDiscount.trim() && !Number.isNaN(Number(form.maxDiscount))) body.maxDiscount = Number(form.maxDiscount);
      if (form.usageLimit.trim() && !Number.isNaN(Number(form.usageLimit))) body.usageLimit = Number(form.usageLimit);
      if (form.perUserLimit.trim() && !Number.isNaN(Number(form.perUserLimit))) body.perUserLimit = Number(form.perUserLimit);
      const res = await axios.post(apiUrl("/api/v1/admin/coupons"), body, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.data?.success) {
        toast.success("Coupon created");
        resetForm();
        fetchCoupons();
      } else {
        toast.error(res.data?.message || "Failed to create coupon");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCoupon) return;
    const token = getToken();
    if (!token) return;
    const value = Number(form.value);
    if (Number.isNaN(value) || value < 0) {
      toast.error("Value must be a non-negative number");
      return;
    }
    const validFrom = form.validFrom ? new Date(form.validFrom) : null;
    const validTo = form.validTo ? new Date(form.validTo) : null;
    if (!validFrom || !validTo) {
      toast.error("Valid from and Valid to are required");
      return;
    }
    setActionLoading(true);
    try {
      const body: any = {
        code: form.code.trim(),
        type: form.type,
        value,
        validFrom,
        validTo,
        description: form.description.trim() || undefined,
        isActive: form.isActive,
        showOnCheckout: form.showOnCheckout,
        audience: form.audience,
      };
      if (form.minOrderAmount.trim() && !Number.isNaN(Number(form.minOrderAmount))) body.minOrderAmount = Number(form.minOrderAmount);
      if (form.maxDiscount.trim() && !Number.isNaN(Number(form.maxDiscount))) body.maxDiscount = Number(form.maxDiscount);
      if (form.usageLimit.trim() && !Number.isNaN(Number(form.usageLimit))) body.usageLimit = Number(form.usageLimit);
      if (form.perUserLimit.trim() && !Number.isNaN(Number(form.perUserLimit))) body.perUserLimit = Number(form.perUserLimit);
      const res = await axios.put(apiUrl(`/api/v1/admin/coupons/${editCoupon._id}`), body, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.data?.success) {
        toast.success("Coupon updated");
        resetForm();
        fetchCoupons();
      } else {
        toast.error(res.data?.message || "Failed to update coupon");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update coupon");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (c: any) => {
    if (!confirm("Deactivate this coupon?")) return;
    const token = getToken();
    if (!token) return;
    setActionLoading(c._id);
    try {
      const res = await axios.delete(apiUrl(`/api/v1/admin/coupons/${c._id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        toast.success("Coupon deactivated");
        fetchCoupons();
      } else {
        toast.error(res.data?.message || "Failed to deactivate");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to deactivate coupon");
    } finally {
      setActionLoading(null);
    }
  };

  const openEdit = (c: any) => {
    setEditCoupon(c);
    setForm({
      code: c.code ?? "",
      type: c.type ?? "percent",
      value: String(c.value ?? ""),
      description: c.description ?? "",
      validFrom: toDateInput(c.validFrom),
      validTo: toDateInput(c.validTo),
      minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : "",
      maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : "",
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
      perUserLimit: c.perUserLimit != null ? String(c.perUserLimit) : "1",
      isActive: c.isActive !== false,
      showOnCheckout: !!c.showOnCheckout,
      audience: c.audience === "new_users" ? "new_users" : "all",
    });
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Coupons" />
      <ComponentCard title="Coupons">
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => {
              setCreateOpen(true);
              resetForm();
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            Create coupon
          </button>
        </div>
        {loading ? (
          <p className="py-6 text-center text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valid</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Checkout</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {coupons.map((c: any) => (
                  <tr key={c._id}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{c.code ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.type ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {c.type === "percent" ? `${c.value}%` : `₹${c.value}`}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                      {c.validFrom ? new Date(c.validFrom).toLocaleDateString() : "—"} – {c.validTo ? new Date(c.validTo).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">{c.isActive !== false ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                      {c.showOnCheckout ? `Yes (${c.audience === "new_users" ? "new" : "all"})` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="px-2 py-1 text-xs rounded bg-gray-600 text-white hover:bg-gray-700">Edit</button>
                        {c.isActive !== false && (
                          <button onClick={() => handleDelete(c)} disabled={actionLoading === c._id} className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">Deactivate</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && coupons.length === 0 && (
              <p className="py-6 text-center text-gray-500">No coupons found.</p>
            )}
          </div>
        )}
      </ComponentCard>

      {(createOpen || editCoupon) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={resetForm} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editCoupon ? "Edit coupon" : "Create coupon"}</h3>
            <form onSubmit={editCoupon ? handleUpdate : handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                  required
                  placeholder="SAVE10"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "flat" })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700">
                    <option value="percent">Percent</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value *</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" required min={0} step={0.01} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valid from *</label>
                <input type="datetime-local" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valid to *</label>
                <input type="datetime-local" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Min order (₹)</label>
                  <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" min={0} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max discount (₹, percent only)</label>
                  <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" min={0} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Usage limit</label>
                  <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" min={0} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Per user limit</label>
                  <input type="number" value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" min={1} />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                <span className="text-sm">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.showOnCheckout}
                  onChange={(e) => setForm({ ...form, showOnCheckout: e.target.checked })}
                />
                <span className="text-sm">Show on checkout (logged-in customers)</span>
              </label>
              <div>
                <label className="block text-sm font-medium mb-1">Audience</label>
                <select
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value as "all" | "new_users" })}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="all">All customers</option>
                  <option value="new_users">New customers (no orders yet, or account under 30 days)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg dark:border-gray-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {actionLoading ? "Saving..." : editCoupon ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
