"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/helper/tokenHelper";
import { useAuth } from "@/context/AuthContext";

const DAYS_OPTIONS = [7, 30, 90];

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function buildCsv(invoices: any[]): string {
  const headers = ["Invoice", "Order Date", "Seller", "Status", "Payment", "Subtotal", "Tax", "Grand Total", "Returned"];
  const rows = invoices.map((row: any) => [
    row.invoiceNumber ?? "",
    row.orderDate ? toDateStr(new Date(row.orderDate)) : "",
    row.sellerName ?? "",
    row.orderStatus ?? "",
    row.paymentStatus ?? "",
    row.subtotal ?? 0,
    row.taxTotal ?? 0,
    row.grandTotal ?? 0,
    row.isReturned ? "Yes" : "No",
  ]);
  const lines = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))];
  return lines.join("\n");
}

export default function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [csvLoading, setCsvLoading] = useState(false);
  const { user } = useAuth();
  const isSeller = user?.role === "seller";
  const analyticsPath = isSeller ? "/api/v1/seller/reports/analytics" : "/api/v1/admin/reports/analytics";
  const invoicesPath = isSeller ? "/api/v1/seller/reports/invoices" : "/api/v1/admin/reports/invoices";

  const fetchAnalytics = useCallback(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(apiUrl(analyticsPath), {
        headers: { Authorization: `Bearer ${token}` },
        params: { days },
      })
      .then((res) => {
        if (res.data?.success) setSummary(res.data.data);
      })
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [analyticsPath, days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleDownloadCsv = async () => {
    const token = getToken();
    if (!token) return;
    const fromDate = from || toDateStr(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const toDate = to || toDateStr(new Date());
    setCsvLoading(true);
    try {
      const res = await axios.get(apiUrl(invoicesPath), {
        headers: { Authorization: `Bearer ${token}` },
        params: { from: fromDate, to: toDate, limit: 500 },
      });
      const data = res.data?.data;
      const items = Array.isArray(data) ? data : data?.items ?? [];
      const csv = buildCsv(items);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${fromDate}-${toDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    } finally {
      setCsvLoading(false);
    }
  };

  if (loading && !summary) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Reports" />
        <p className="py-6 text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  const s = summary?.summary ?? summary;

  return (
    <div>
      <PageBreadcrumb pageTitle="Reports" />
      <ComponentCard title={isSeller ? "Sales Analytics" : "Platform Analytics"}>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Period (days):</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
            >
              {DAYS_OPTIONS.map((d) => (
                <option key={d} value={d}>{d} days</option>
              ))}
            </select>
          </div>
        </div>
        {summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {s?.totalGMV != null && (
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total GMV</p>
                <p className="text-xl font-semibold">₹{Number(s.totalGMV).toLocaleString("en-IN")}</p>
              </div>
            )}
            {s?.totalRevenue != null && (
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-xl font-semibold">₹{Number(s.totalRevenue).toLocaleString("en-IN")}</p>
              </div>
            )}
            {(s?.totalOrders != null || s?.totalOrders === 0) && (
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Orders</p>
                <p className="text-xl font-semibold">{s.totalOrders}</p>
              </div>
            )}
            {s?.totalCustomers != null && (
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Customers</p>
                <p className="text-xl font-semibold">{s.totalCustomers}</p>
              </div>
            )}
            {s?.totalSellers != null && (
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">Sellers</p>
                <p className="text-xl font-semibold">{s.totalSellers}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="py-6 text-center text-gray-500">No report data available.</p>
        )}
      </ComponentCard>

      <ComponentCard title="Export CSV" className="mt-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Download invoice-level report for a date range (up to 500 rows).</p>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
          </div>
          <button
            onClick={handleDownloadCsv}
            disabled={csvLoading}
            className="mt-5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
          >
            {csvLoading ? "Preparing…" : "Download CSV"}
          </button>
        </div>
      </ComponentCard>
    </div>
  );
}
