"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/helper/tokenHelper";

const SHIPMENT_STATUSES = ["shipped", "in_transit", "out_for_delivery", "delivered", "returned", "cancelled"];

export default function ShipmentsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipmentsByOrder, setShipmentsByOrder] = useState<Record<string, any[]>>({});
  const [createModal, setCreateModal] = useState<{ orderId: string; orderNumber?: string } | null>(null);
  const [updateModal, setUpdateModal] = useState<{ orderId: string; shipmentId: string; currentStatus: string; awb?: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [createForm, setCreateForm] = useState({ carrierCode: "MANUAL", awbNumber: "", trackingUrl: "", status: "shipped" });
  const [updateForm, setUpdateForm] = useState({ status: "", location: "", description: "" });

  const fetchOrders = useCallback(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(apiUrl("/api/v1/seller/orders"), {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 50 },
      })
      .then((res) => {
        const d = res.data?.data;
        const list = d?.items ?? (Array.isArray(d) ? d : []);
        setOrders(list);
        const oids = list.map((o: any) => o._id);
        return Promise.all(
          oids.map((oid: string) =>
            axios.get(apiUrl(`/api/v1/seller/shipments/orders/${oid}`), { headers: { Authorization: `Bearer ${token}` } }).then((r) => ({ oid, data: r.data?.data ?? [] }))
          )
        );
      })
      .then((results) => {
        const map: Record<string, any[]> = {};
        results.forEach(({ oid, data }) => {
          map[oid] = Array.isArray(data) ? data : [];
        });
        setShipmentsByOrder(map);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createModal) return;
    const token = getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await axios.post(
        apiUrl("/api/v1/seller/shipments"),
        {
          orderId: createModal.orderId,
          carrierCode: createForm.carrierCode,
          awbNumber: createForm.awbNumber.trim() || undefined,
          trackingUrl: createForm.trackingUrl.trim() || undefined,
          status: createForm.status,
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        toast.success("Shipment created");
        setCreateModal(null);
        setCreateForm({ carrierCode: "MANUAL", awbNumber: "", trackingUrl: "", status: "shipped" });
        fetchOrders();
      } else {
        toast.error(res.data?.message || "Failed to create shipment");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create shipment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateModal || !updateForm.status) return;
    const token = getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await axios.patch(
        apiUrl(`/api/v1/seller/shipments/${updateModal.orderId}/${updateModal.shipmentId}/status`),
        { status: updateForm.status, location: updateForm.location.trim() || undefined, description: updateForm.description.trim() || undefined },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        toast.success("Shipment status updated");
        setUpdateModal(null);
        setUpdateForm({ status: "", location: "", description: "" });
        fetchOrders();
      } else {
        toast.error(res.data?.message || "Failed to update");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Shipments" />
      <ComponentCard title="Orders &amp; Shipments">
        {loading ? (
          <p className="py-6 text-center text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-6">
            {orders.map((o: any) => {
              const shipments = shipmentsByOrder[o._id] ?? [];
              return (
                <div key={o._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Order {o.orderNumber ?? o._id}</span>
                      <span className="ml-2 text-sm text-gray-500">{o.orderStatus ?? "—"}</span>
                    </div>
                    <button
                      onClick={() => setCreateModal({ orderId: o._id, orderNumber: o.orderNumber })}
                      className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      Create shipment
                    </button>
                  </div>
                  {shipments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 text-gray-500 font-medium">AWB</th>
                            <th className="text-left py-2 text-gray-500 font-medium">Carrier</th>
                            <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                            <th className="text-left py-2 text-gray-500 font-medium">Tracking</th>
                            <th className="text-left py-2 text-gray-500 font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shipments.map((s: any) => (
                            <tr key={s._id} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2 text-gray-900 dark:text-white">{s.awbNumber ?? "—"}</td>
                              <td className="py-2 text-gray-600 dark:text-gray-400">{s.carrierName ?? s.carrierCode ?? "—"}</td>
                              <td className="py-2 text-gray-600 dark:text-gray-400">{s.status ?? "—"}</td>
                              <td className="py-2">
                                {s.trackingUrl ? (
                                  <a href={s.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate max-w-[120px] inline-block">Track</a>
                                ) : "—"}
                              </td>
                              <td className="py-2">
                                <button
                                  onClick={() => {
                                    setUpdateModal({ orderId: o._id, shipmentId: s._id, currentStatus: s.status ?? "", awb: s.awbNumber });
                                    setUpdateForm({ status: s.status ?? "", location: "", description: "" });
                                  }}
                                  className="text-indigo-600 hover:underline text-sm"
                                >
                                  Update status
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No shipments yet. Create one above.</p>
                  )}
                </div>
              );
            })}
            {!loading && orders.length === 0 && <p className="py-6 text-center text-gray-500">No orders yet.</p>}
          </div>
        )}
      </ComponentCard>

      {createModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCreateModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create shipment — Order {createModal.orderNumber ?? createModal.orderId}</h3>
            <form onSubmit={handleCreateShipment} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Carrier code</label>
                <select value={createForm.carrierCode} onChange={(e) => setCreateForm({ ...createForm, carrierCode: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700">
                  <option value="MANUAL">MANUAL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">AWB number</label>
                <input type="text" value={createForm.awbNumber} onChange={(e) => setCreateForm({ ...createForm, awbNumber: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tracking URL</label>
                <input type="url" value={createForm.trackingUrl} onChange={(e) => setCreateForm({ ...createForm, trackingUrl: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" placeholder="Optional" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700">
                  {SHIPMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCreateModal(null)} className="px-4 py-2 border rounded-lg dark:border-gray-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {updateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setUpdateModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Update shipment status {updateModal.awb ? `— ${updateModal.awb}` : ""}</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">New status *</label>
                <select value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" required>
                  {SHIPMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location (optional)</label>
                <input type="text" value={updateForm.location} onChange={(e) => setUpdateForm({ ...updateForm, location: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <input type="text" value={updateForm.description} onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setUpdateModal(null)} className="px-4 py-2 border rounded-lg dark:border-gray-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
