"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  Box,
  IndianRupee,
  Layers,
  LayoutGrid,
  Package,
  ShoppingBasket,
  Store,
  Ticket,
  TrendingUp,
  Users,
  UserCircle,
  RotateCcw,
} from "lucide-react";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/helper/tokenHelper";
import { formatInr, formatInrCompact } from "@/lib/formatInr";
import type { AdminAnalyticsPayload } from "@/types/analytics";
import { shortChartDate } from "@/lib/chartDate";
import { AnalyticsAreaChart } from "@/components/dashboard/AnalyticsAreaChart";
import { AnalyticsLineChart } from "@/components/dashboard/AnalyticsLineChart";
import { AnalyticsHorizontalBarChart } from "@/components/dashboard/AnalyticsHorizontalBarChart";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartEmptyState } from "@/components/dashboard/ChartEmptyState";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";

const DAYS_OPTIONS = [7, 30, 90] as const;

const shortcuts = [
  { href: "/admin/product", label: "Products", icon: Box },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBasket },
  { href: "/admin/sellers", label: "Sellers", icon: Store },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/returns", label: "Returns", icon: RotateCcw },
  { href: "/admin/customers", label: "Customers", icon: UserCircle },
  { href: "/admin/homepage", label: "Homepage", icon: LayoutGrid },
] as const;

export default function AdminOverviewPage() {
  const [days, setDays] = useState<(typeof DAYS_OPTIONS)[number]>(30);
  const [data, setData] = useState<AdminAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      setError("Not signed in.");
      return;
    }
    setLoading(true);
    setError(null);
    axios
      .get(apiUrl("/api/v1/admin/reports/analytics"), {
        headers: { Authorization: `Bearer ${token}` },
        params: { days },
      })
      .then((res) => {
        if (res.data?.success) setData(res.data.data as AdminAnalyticsPayload);
        else setData(null);
      })
      .catch(() => {
        setData(null);
        setError("Could not load analytics.");
      })
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = data?.summary;
  const gmvRows = data?.gmvOverTime ?? [];
  const growthRows = data?.userGrowth ?? [];
  const topSellers = data?.topSellers ?? [];

  const gmvCategories = gmvRows.map((r) => shortChartDate(r._id));
  const gmvSeries = [{ name: "GMV", data: gmvRows.map((r) => Number(r.gmv) || 0) }];

  const growthCategories = growthRows.map((r) => shortChartDate(r._id));
  const growthSeries = [
    { name: "New customers", data: growthRows.map((r) => Number(r.newUsers) || 0) },
  ];

  const sellerNames = topSellers.map((r) => r.name || "Seller");
  const sellerRevenue = topSellers.map((r) => Number(r.revenue) || 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-gray-200/80 pb-6 dark:border-white/[0.08] sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
            Overview
          </h1>
          <p className="mt-1 max-w-xl text-sm text-gray-500 dark:text-gray-400">
            Platform health, revenue trend, and customer growth at a glance.
          </p>
        </div>
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
      </header>

      {error ? (
        <p className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-800 dark:border-error-900 dark:bg-error-950/40 dark:text-error-200">
          {error}
        </p>
      ) : null}

      {loading && !data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : null}

      {data ? (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summary?.totalGMV != null && (
              <KpiCard
                label="Total GMV"
                value={formatInr(Number(summary.totalGMV))}
                hint="Gross merchandise value"
                icon={<IndianRupee className="h-5 w-5" aria-hidden />}
              />
            )}
            {(summary?.totalOrders != null || summary?.totalOrders === 0) && (
              <KpiCard
                label="Orders"
                value={String(summary.totalOrders)}
                icon={<ShoppingBasket className="h-5 w-5" aria-hidden />}
              />
            )}
            {summary?.avgOrderValue != null && (
              <KpiCard
                label="Avg order value"
                value={formatInr(Number(summary.avgOrderValue))}
                icon={<TrendingUp className="h-5 w-5" aria-hidden />}
              />
            )}
            {summary?.totalCustomers != null && (
              <KpiCard
                label="Customers"
                value={String(summary.totalCustomers)}
                icon={<Users className="h-5 w-5" aria-hidden />}
              />
            )}
            {summary?.totalSellers != null && (
              <KpiCard
                label="Sellers"
                value={String(summary.totalSellers)}
                icon={<Store className="h-5 w-5" aria-hidden />}
              />
            )}
            {summary?.totalProducts != null && (
              <KpiCard
                label="Active products"
                value={String(summary.totalProducts)}
                icon={<Package className="h-5 w-5" aria-hidden />}
              />
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <section className="premium-card overflow-hidden border border-[color-mix(in_srgb,var(--color-gray-200)_88%,transparent)] dark:border-white/[0.08] xl:col-span-3">
              <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  GMV over time
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Daily totals for the selected period
                </p>
              </div>
              <div className="px-2 pb-2 pt-1 sm:px-4">
                {loading ? (
                  <ChartSkeleton height={300} />
                ) : gmvRows.length === 0 ? (
                  <ChartEmptyState message="No orders in this period yet." />
                ) : (
                  <AnalyticsAreaChart
                    categories={gmvCategories}
                    series={gmvSeries}
                    height={300}
                    formatY={formatInrCompact}
                  />
                )}
              </div>
            </section>

            <section className="premium-card overflow-hidden border border-[color-mix(in_srgb,var(--color-gray-200)_88%,transparent)] dark:border-white/[0.08] xl:col-span-2">
              <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  New customers
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sign-ups per day
                </p>
              </div>
              <div className="px-2 pb-2 pt-1 sm:px-4">
                {loading ? (
                  <ChartSkeleton height={260} />
                ) : growthRows.length === 0 ? (
                  <ChartEmptyState message="No new customers in this window." />
                ) : (
                  <AnalyticsLineChart
                    categories={growthCategories}
                    series={growthSeries}
                    height={260}
                  />
                )}
              </div>
            </section>
          </div>

          <section className="premium-card overflow-hidden border border-[color-mix(in_srgb,var(--color-gray-200)_88%,transparent)] dark:border-white/[0.08]">
            <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Top sellers by revenue
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Based on line totals in the selected period
              </p>
            </div>
            <div className="px-2 pb-4 pt-2 sm:px-4">
              {loading ? (
                <ChartSkeleton height={280} />
              ) : topSellers.length === 0 ? (
                <ChartEmptyState message="No seller revenue for this period yet." />
              ) : (
                <AnalyticsHorizontalBarChart
                  categories={sellerNames}
                  data={sellerRevenue}
                  formatX={formatInrCompact}
                />
              )}
            </div>
          </section>
        </>
      ) : null}

      {!loading && !data && !error ? (
        <p className="text-center text-sm text-gray-500">No analytics data available.</p>
      ) : null}

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Shortcuts
        </h2>
        <div className="flex flex-wrap gap-2">
          {shortcuts.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="premium-chip inline-flex items-center gap-2 border-gray-200/90 text-gray-700 transition hover:border-brand-200 hover:bg-brand-50/80 hover:text-brand-700 dark:border-white/[0.08] dark:text-gray-200 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
            >
              <Icon className="h-3.5 w-3.5 opacity-70" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
