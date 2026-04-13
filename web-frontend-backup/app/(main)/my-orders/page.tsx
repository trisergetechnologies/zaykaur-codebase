"use client";

import { useEffect, useState } from "react";
import useAuthStore from "@/store/authStore";
import { apiGet } from "@/lib/api";
import { mapCustomerOrderListItem } from "@/lib/customerOrder";
import type { CustomerOrderListItem } from "@/lib/customerOrder";
import { OrderListCard } from "@/components/orders/OrderListCard";
import { OrdersEmptyState } from "@/components/orders/OrdersEmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const MyOrdersPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<CustomerOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    apiGet<any>("/api/v1/customer/order")
      .then((res) => {
        if (res.success && res.data) {
          const items = Array.isArray(res.data)
            ? res.data
            : res.data.items ?? res.data.orders ?? [];
          if (items.length > 0) {
            setOrders(items.map((o: any) => mapCustomerOrderListItem(o)));
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-50/60 pb-12 pt-8 dark:bg-slate-950/40">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="mb-8 h-10 w-48 rounded-lg" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen bg-slate-50/60 px-4 pb-12 pt-16 text-center dark:bg-slate-950/40">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Sign in to view orders</h1>
        <p className="mt-2 text-sm text-slate-500">Your order history is available after you sign in.</p>
        <Button asChild className="mt-6 rounded-lg bg-pink-600 hover:bg-pink-700">
          <Link href="/sign-in?redirect=%2Fmy-orders">Sign in</Link>
        </Button>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="min-h-screen bg-slate-50/60 pb-12 pt-8 dark:bg-slate-950/40">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
              My orders
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Everything you have purchased in one place.
            </p>
          </header>
          <OrdersEmptyState />
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50/60 pb-12 pt-8 dark:bg-slate-950/40">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl">
            My orders
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track shipments, view invoices, and manage returns from one place.
          </p>
        </header>

        <div className="space-y-4">
          {orders.map((order) => (
            <OrderListCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyOrdersPage;
