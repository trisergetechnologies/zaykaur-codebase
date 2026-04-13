"use client";

import { useEffect, useState } from "react";
import useOrderStore from "@/store/orderStore";
import useAuthStore from "@/store/authStore";
import { apiGet } from "@/lib/api";
import { mapCustomerOrderListItem } from "@/lib/customerOrder";
import type { CustomerOrderListItem } from "@/lib/customerOrder";
import { OrderListCard } from "@/components/orders/OrderListCard";
import { OrdersEmptyState } from "@/components/orders/OrdersEmptyState";
import { Skeleton } from "@/components/ui/skeleton";

const OrdersPage = () => {
  const { orders: localOrders, cancelOrder } = useOrderStore();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<CustomerOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      apiGet<any>("/api/v1/customer/order")
        .then((res) => {
          if (res.success && res.data) {
            const items = Array.isArray(res.data)
              ? res.data
              : res.data.items ?? res.data.orders ?? [];
            setOrders(items.map((o: any) => mapCustomerOrderListItem(o)));
          }
        })
        .catch(() => {
          setOrders(
            localOrders.map((o) =>
              mapCustomerOrderListItem({
                _id: o.id,
                orderNumber: o.id,
                createdAt: o.createdAt,
                grandTotal: o.total,
                orderStatus: o.status,
                paymentMethod: o.paymentMethod,
                paymentStatus: "pending",
                items: o.items.map((it) => ({
                  productId: it.id,
                  name: it.name,
                  sku: "—",
                  quantity: it.quantity,
                  unitPrice: it.price,
                  taxRate: 0,
                  taxAmount: 0,
                  lineTotal: it.price * it.quantity,
                  productSnapshot: { image: it.image },
                })),
              })
            )
          );
        })
        .finally(() => setLoading(false));
    } else {
      setOrders(
        localOrders.map((o) =>
          mapCustomerOrderListItem({
            _id: o.id,
            orderNumber: o.id,
            createdAt: o.createdAt,
            grandTotal: o.total,
            orderStatus: o.status,
            paymentMethod: o.paymentMethod,
            paymentStatus: "pending",
            items: o.items.map((it) => ({
              productId: it.id,
              name: it.name,
              sku: "—",
              quantity: it.quantity,
              unitPrice: it.price,
              taxRate: 0,
              taxAmount: 0,
              lineTotal: it.price * it.quantity,
              productSnapshot: { image: it.image },
            })),
          })
        )
      );
      setLoading(false);
    }
  }, [isAuthenticated, localOrders]);

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-50/60 pb-12 pt-8 dark:bg-slate-950/40">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="mb-8 h-10 w-48 rounded-lg" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!orders.length) {
    return (
      <section className="min-h-screen bg-slate-50/60 pb-12 pt-8 dark:bg-slate-950/40">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
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
            <div key={order.id} className="relative">
              <OrderListCard order={order} />
              {order.orderStatus === "placed" && !isAuthenticated && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    className="text-xs font-medium text-red-600 hover:underline"
                    onClick={() => cancelOrder(order.id)}
                  >
                    Cancel order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrdersPage;
