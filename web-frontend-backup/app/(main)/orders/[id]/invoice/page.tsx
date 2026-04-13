"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useOrderStore from "@/store/orderStore";
import useAuthStore from "@/store/authStore";
import { mapCustomerOrderDetail, type CustomerOrderDetail } from "@/lib/customerOrder";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderInvoiceDocument } from "@/components/orders/OrderInvoiceDocument";
import { Printer, ArrowLeft } from "lucide-react";

export default function OrderInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { orders: localOrders } = useOrderStore();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-print-invoice", "true");
    return () => document.documentElement.removeAttribute("data-print-invoice");
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(`/orders/${id}/invoice`)}`);
      return;
    }
    if (!id) return;

    apiGet<any>(`/api/v1/customer/order/${id}`)
      .then((res) => {
        if (res.success && res.data) {
          setOrder(mapCustomerOrderDetail(res.data));
        }
      })
      .catch(() => {
        const local = localOrders.find((o) => o.id === id);
        if (local) {
          setOrder(
            mapCustomerOrderDetail({
              _id: local.id,
              orderNumber: local.id,
              createdAt: local.createdAt,
              grandTotal: local.total,
              subtotal: local.total,
              taxTotal: 0,
              shippingAmount: 0,
              discountTotal: 0,
              currency: "INR",
              orderStatus: local.status,
              paymentMethod: local.paymentMethod,
              paymentStatus: "pending",
              shippingAddress: {
                fullName: local.address.name,
                phone: local.address.phone,
                street: local.address.address,
                city: "",
                state: "",
                postalCode: "",
                country: "India",
              },
              items: local.items.map((it) => ({
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
              shipments: [],
            })
          );
        }
      })
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, localOrders, router]);

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-50/60 pb-12 pt-8">
        <div className="mx-auto max-w-3xl px-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="mt-6 h-[600px] rounded-2xl" />
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="min-h-screen px-4 py-16 text-center">
        <p className="text-slate-600">Order not found.</p>
        <Button asChild className="mt-4">
          <Link href="/orders">Back to orders</Link>
        </Button>
      </section>
    );
  }

  const isDelivered = order.orderStatus === "delivered";

  return (
    <section className="min-h-screen bg-slate-100/80 pb-12 pt-6 print:bg-white print:pt-0">
      <div className="mx-auto max-w-3xl px-4 print:max-w-none print:px-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Button variant="outline" asChild className="rounded-lg">
            <Link href={`/orders/${id}`} className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to order
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            {isDelivered && (
              <Button
                type="button"
                className="rounded-lg bg-pink-600 hover:bg-pink-700"
                onClick={() => window.print()}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print / Save as PDF
              </Button>
            )}
          </div>
        </div>

        {!isDelivered ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900 print:hidden">
            <p className="font-semibold">Invoice available after delivery</p>
            <p className="mt-2 text-amber-800">
              Your tax invoice will be ready to print or save as PDF once the order status is
              <span className="font-medium"> Delivered</span>. Current status:{" "}
              <span className="font-medium capitalize">{order.orderStatus.replace(/_/g, " ")}</span>.
            </p>
            <Button asChild className="mt-4 rounded-lg" variant="outline">
              <Link href={`/orders/${id}`}>View order</Link>
            </Button>
          </div>
        ) : null}

        <div
          className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 ${
            !isDelivered ? "hidden print:hidden" : ""
          }`}
        >
          <OrderInvoiceDocument order={order} />
        </div>
      </div>
    </section>
  );
}
