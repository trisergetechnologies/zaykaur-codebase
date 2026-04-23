"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  IndianRupee,
  Package,
  ShoppingBasket,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/helper/tokenHelper";
import { useAuth } from "@/context/AuthContext";
import { formatInr, formatInrCompact } from "@/lib/formatInr";
import { shortChartDate } from "@/lib/chartDate";
import type {
  AdminAnalyticsPayload,
  SellerAnalyticsPayload,
} from "@/types/analytics";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AnalyticsAreaChart } from "@/components/dashboard/AnalyticsAreaChart";
import { AnalyticsLineChart } from "@/components/dashboard/AnalyticsLineChart";
import { AnalyticsHorizontalBarChart } from "@/components/dashboard/AnalyticsHorizontalBarChart";
import { ChartEmptyState } from "@/components/dashboard/ChartEmptyState";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";

const DAYS_OPTIONS = [7, 30, 90] as const;

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

type InvoiceCsvRow = {
  invoiceNumber?: string;
  orderDate?: string;
  sellerName?: string;
  orderStatus?: string;
  paymentStatus?: string;
  subtotal?: number;
  taxTotal?: number;
  grandTotal?: number;
  isReturned?: boolean;
};

function buildCsv(invoices: InvoiceCsvRow[]): string {
  const headers = ["Invoice", "Order Date", "Seller", "Status", "Payment", "Subtotal", "Tax", "Grand Total", "Returned"];
  const rows = invoices.map((row) => [
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
  const [payload, setPayload] = useState<AdminAnalyticsPayload | SellerAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<(typeof DAYS_OPTIONS)[number]>(30);
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
        if (res.data?.success) setPayload(res.data.data);
        else setPayload(null);
      })
      .catch(() => setPayload(null))
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

  const s = payload?.summary;

  const adminPayload = !isSeller && payload ? (payload as AdminAnalyticsPayload) : null;
  const sellerPayload = isSeller && payload ? (payload as SellerAnalyticsPayload) : null;

  const gmvRows = adminPayload?.gmvOverTime ?? [];
  const growthRows = adminPayload?.userGrowth ?? [];
  const topSellers = adminPayload?.topSellers ?? [];

  const salesRows = sellerPayload?.salesOverTime ?? [];
  const topProducts = sellerPayload?.topProducts ?? [];

  if (loading && !payload) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Reports" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
        <ChartSkeleton height={320} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageBreadcrumb pageTitle="Reports" />
      <div className="-mt-2 mb-2 flex justify-end sm:-mt-4">
        <div
          className="inline-flex rounded-xl border border-gray-200/90 bg-white/90 p-1 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900/80"
          role="group"
          aria-label="Period"
        >
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                days === d
                  ? "bg-brand-500 text-white shadow-theme-sm"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <ComponentCard
        title={isSeller ? "Sales analytics" : "Platform analytics"}
        desc={isSeller ? "Your revenue and catalog performance." : "GMV, orders, and growth for the selected period."}
      >
        {!payload ? (
          <p className="py-6 text-center text-sm text-gray-500">No report data available.</p>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {!isSeller && s && "totalGMV" in s && s.totalGMV != null && (
                <KpiCard
                  label="Total GMV"
                  value={formatInr(Number(s.totalGMV))}
                  icon={<IndianRupee className="h-5 w-5" aria-hidden />}
                />
              )}
              {isSeller && s && "totalRevenue" in s && s.totalRevenue != null && (
                <KpiCard
                  label="Total revenue"
                  value={formatInr(Number(s.totalRevenue))}
                  icon={<IndianRupee className="h-5 w-5" aria-hidden />}
                />
              )}
              {(s?.totalOrders != null || s?.totalOrders === 0) && (
                <KpiCard
                  label="Orders"
                  value={String(s.totalOrders)}
                  icon={<ShoppingBasket className="h-5 w-5" aria-hidden />}
                />
              )}
              {!isSeller && s && "totalCustomers" in s && s.totalCustomers != null && (
                <KpiCard
                  label="Customers"
                  value={String(s.totalCustomers)}
                  icon={<Users className="h-5 w-5" aria-hidden />}
                />
              )}
              {!isSeller && s && "totalSellers" in s && s.totalSellers != null && (
                <KpiCard
                  label="Sellers"
                  value={String(s.totalSellers)}
                  icon={<Store className="h-5 w-5" aria-hidden />}
                />
              )}
              {!isSeller && s && "avgOrderValue" in s && s.avgOrderValue != null && (
                <KpiCard
                  label="Avg order value"
                  value={formatInr(Number(s.avgOrderValue))}
                  icon={<TrendingUp className="h-5 w-5" aria-hidden />}
                />
              )}
              {!isSeller && s && "totalProducts" in s && s.totalProducts != null && (
                <KpiCard
                  label="Active products"
                  value={String(s.totalProducts)}
                  icon={<Package className="h-5 w-5" aria-hidden />}
                />
              )}
              {isSeller && s && "totalUnits" in s && s.totalUnits != null && (
                <KpiCard
                  label="Units sold"
                  value={String(s.totalUnits)}
                  icon={<Package className="h-5 w-5" aria-hidden />}
                />
              )}
              {isSeller && s && "avgOrderValue" in s && s.avgOrderValue != null && (
                <KpiCard
                  label="Avg order value"
                  value={formatInr(Number(s.avgOrderValue))}
                  icon={<TrendingUp className="h-5 w-5" aria-hidden />}
                />
              )}
            </div>

            {!isSeller ? (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/60 dark:border-white/[0.08] dark:bg-gray-900/30 xl:col-span-3">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">GMV over time</h3>
                  </div>
                  <div className="px-2 pb-2 pt-1">
                    {loading ? (
                      <ChartSkeleton height={280} />
                    ) : gmvRows.length === 0 ? (
                      <ChartEmptyState message="No orders in this period yet." />
                    ) : (
                      <AnalyticsAreaChart
                        categories={gmvRows.map((r) => shortChartDate(r._id))}
                        series={[{ name: "GMV", data: gmvRows.map((r) => Number(r.gmv) || 0) }]}
                        height={280}
                        formatY={formatInrCompact}
                      />
                    )}
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/60 dark:border-white/[0.08] dark:bg-gray-900/30 xl:col-span-2">
                  <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New customers</h3>
                  </div>
                  <div className="px-2 pb-2 pt-1">
                    {loading ? (
                      <ChartSkeleton height={240} />
                    ) : growthRows.length === 0 ? (
                      <ChartEmptyState message="No new customers in this window." />
                    ) : (
                      <AnalyticsLineChart
                        categories={growthRows.map((r) => shortChartDate(r._id))}
                        series={[
                          {
                            name: "New customers",
                            data: growthRows.map((r) => Number(r.newUsers) || 0),
                          },
                        ]}
                        height={240}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/60 dark:border-white/[0.08] dark:bg-gray-900/30">
                <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Revenue over time</h3>
                </div>
                <div className="px-2 pb-2 pt-1">
                  {loading ? (
                    <ChartSkeleton height={280} />
                  ) : salesRows.length === 0 ? (
                    <ChartEmptyState message="No sales in this period yet." />
                  ) : (
                    <AnalyticsAreaChart
                      categories={salesRows.map((r) => shortChartDate(r._id))}
                      series={[{ name: "Revenue", data: salesRows.map((r) => Number(r.revenue) || 0) }]}
                      height={280}
                      formatY={formatInrCompact}
                    />
                  )}
                </div>
              </div>
            )}

            {!isSeller ? (
              <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/60 dark:border-white/[0.08] dark:bg-gray-900/30">
                <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top sellers</h3>
                </div>
                <div className="px-2 pb-4 pt-2">
                  {loading ? (
                    <ChartSkeleton height={260} />
                  ) : topSellers.length === 0 ? (
                    <ChartEmptyState message="No seller revenue for this period yet." />
                  ) : (
                    <AnalyticsHorizontalBarChart
                      categories={topSellers.map((r) => r.name || "Seller")}
                      data={topSellers.map((r) => Number(r.revenue) || 0)}
                      formatX={formatInrCompact}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/60 dark:border-white/[0.08] dark:bg-gray-900/30">
                <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top products</h3>
                </div>
                <div className="px-2 pb-4 pt-2">
                  {loading ? (
                    <ChartSkeleton height={260} />
                  ) : topProducts.length === 0 ? (
                    <ChartEmptyState message="No product sales in this period yet." />
                  ) : (
                    <AnalyticsHorizontalBarChart
                      categories={topProducts.map((r) => r.name || "Product")}
                      data={topProducts.map((r) => Number(r.totalRevenue) || 0)}
                      formatX={formatInrCompact}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </ComponentCard>

      <section className="rounded-2xl border border-dashed border-gray-200/90 bg-gray-50/60 px-5 py-5 dark:border-gray-700 dark:bg-gray-900/35">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">Export CSV</h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Download invoice-level report for a date range (up to 500 rows).
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={csvLoading}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:opacity-50"
          >
            {csvLoading ? "Preparing…" : "Download CSV"}
          </button>
        </div>
      </section>
    </div>
  );
}
