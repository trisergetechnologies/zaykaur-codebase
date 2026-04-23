"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ChangeStatusModal from "./ChangeStatusModal";
import OrderDetailsModal from "./OrderDetailsModal";
import PaymentStatusModal from "./PaymentStatusModal";
import Pagination from "./Pagination";
import { getToken } from "@/helper/tokenHelper";
import { apiUrl } from "@/lib/api";
import { downloadSellerShippingLabel } from "@/lib/sellerShippingLabelDownload";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  productId?: { _id: string };
  sellerId?: { _id?: string; name?: string; email?: string } | string;
  productTitle?: string;
  productThumbnail?: string;
  name?: string;
  productSnapshot?: { name?: string; image?: string };
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
  mrp?: number;
}

interface Order {
  _id: string;
  orderNumber?: string;
  userId?: { _id: string; name: string; email: string };
  buyerId?: { _id: string; name: string; email: string };
  items: OrderItem[];
  orderStatus?: string;
  status?: string;
  paymentStatus: string;
  grandTotal?: number;
  subtotal?: number;
  taxTotal?: number;
  shippingAmount?: number;
  discountTotal?: number;
  couponCode?: string;
  finalAmountPaid?: number;
  createdAt: string;
  shippingAddress?: {
    fullName?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    pincode?: string;
    phone?: string;
  };
  deliveryAddress?: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
}

function sellerNames(order: Order): string {
  const names = new Set<string>();
  for (const item of order.items || []) {
    if (item?.sellerId && typeof item.sellerId === "object") {
      const name = item.sellerId.name || item.sellerId.email;
      if (name) names.add(name);
    }
  }
  return names.size ? Array.from(names).join(", ") : "—";
}

function normalizeOrder(raw: Record<string, unknown>): Order {
  const source = raw as {
    _id: string;
    orderNumber?: string;
    userId?: { _id: string; name: string; email: string };
    buyerId?: { _id: string; name: string; email: string };
    items?: Array<Record<string, unknown>>;
    orderStatus?: string;
    status?: string;
    paymentStatus?: string;
    grandTotal?: number;
    subtotal?: number;
    taxTotal?: number;
    shippingAmount?: number;
    discountTotal?: number;
    couponCode?: string;
    finalAmountPaid?: number;
    createdAt: string;
    shippingAddress?: Order["shippingAddress"];
  };
  const userId = source.userId || source.buyerId;
  const items = (source.items || []).map((it) => {
    const item = it as {
      productSnapshot?: { name?: string; image?: string };
      name?: string;
      productTitle?: string;
      productThumbnail?: string;
      quantity?: number;
      unitPrice?: number;
      lineTotal?: number;
      productId?: { _id: string };
      mrp?: number;
    };
    return {
      ...item,
      quantity: Number(item.quantity || 0),
      productTitle: item.productSnapshot?.name ?? item.name ?? item.productTitle,
      productThumbnail: item.productSnapshot?.image ?? item.productThumbnail,
      mrp: item.mrp,
    };
  });
  return {
    _id: source._id,
    orderNumber: source.orderNumber,
    userId,
    buyerId: userId,
    items,
    orderStatus: source.orderStatus ?? source.status,
    status: source.orderStatus ?? source.status,
    paymentStatus: source.paymentStatus ?? "pending",
    grandTotal: source.grandTotal,
    subtotal: source.subtotal,
    taxTotal: source.taxTotal,
    shippingAmount: source.shippingAmount,
    discountTotal: source.discountTotal,
    couponCode: source.couponCode,
    finalAmountPaid: source.grandTotal ?? source.finalAmountPaid ?? 0,
    createdAt: source.createdAt,
    shippingAddress: source.shippingAddress,
    deliveryAddress: source.shippingAddress
      ? {
          fullName: source.shippingAddress.fullName ?? "",
          street: source.shippingAddress.street ?? "",
          city: source.shippingAddress.city ?? "",
          state: source.shippingAddress.state ?? "",
          pincode: source.shippingAddress.postalCode ?? source.shippingAddress.pincode ?? "",
          phone: source.shippingAddress.phone ?? "",
        }
      : undefined,
  };
}

export default function BasicTableOne() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [openStatus, setOpenStatus] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [openPayment, setOpenPayment] = useState(false);

  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const token = getToken();
  const { user } = useAuth();
  const isSeller = user?.role === "seller";
  const ordersPath = isSeller ? "/api/v1/seller/orders" : "/api/v1/admin/orders";

  const fetchOrders = useCallback(
    async (pageNum: number = 1) => {
      if (!token) return;
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          page: pageNum,
          limit,
        };
        if (searchId.trim()) params.search = searchId.trim();
        if (statusFilter) params.status = statusFilter;
        if (paymentFilter) params.paymentStatus = paymentFilter;

        const res = await axios.get(apiUrl(ordersPath), {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        const data = res.data?.data;
        const list = data?.items ?? (Array.isArray(data) ? data : []);
        setOrders(list.map(normalizeOrder));
        const pag = data?.pagination;
        if (pag) {
          setTotalPages(pag.totalPages ?? 1);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [token, ordersPath, searchId, statusFilter, paymentFilter]
  );

  useEffect(() => {
    fetchOrders(page);
  }, [fetchOrders, page]);

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOpenDetails(true);
  };

  const openChangeStatus = (order: Order) => {
    setStatusOrder(order);
    setOpenStatus(true);
  };

  const openPaymentStatus = (order: Order) => {
    setPaymentOrder(order);
    setOpenPayment(true);
  };

  const handleFilterApply = () => {
    setPage(1);
    fetchOrders(1);
  };

  const displayStatus = (order: Order) => order.status ?? order.orderStatus ?? "";
  /** Amount customer pays (after discounts) */
  const displayAmount = (order: Order) =>
    order.grandTotal ?? order.finalAmountPaid ?? 0;
  const buyer = (order: Order) => order.buyerId ?? order.userId;

  return (
    <div className="premium-card overflow-hidden">
      <div className="border-b border-white/70 p-4 dark:border-white/[0.05] flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilterApply()}
            placeholder="Search by Order number..."
            className="rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            onClick={handleFilterApply}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="border-b border-white/70 bg-white/70 dark:border-white/[0.05] dark:bg-gray-800">
            <TableRow>
              <TableCell isHeader>Customer</TableCell>
              {!isSeller && <TableCell isHeader>Seller(s)</TableCell>}
              <TableCell isHeader>Order #</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader>Payment</TableCell>
              <TableCell isHeader>Amount</TableCell>
              <TableCell isHeader>Date</TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell colSpan={isSeller ? 7 : 8} className="text-center py-6">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isSeller ? 7 : 8} className="text-center py-6">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow
                  key={order._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                >
                  <TableCell className="px-4 py-3">
                    <div>
                      <span className="block font-medium text-gray-800 dark:text-white/90">
                        {buyer(order)?.name ?? "—"}
                      </span>
                      <span className="block text-gray-500 text-xs">
                        {buyer(order)?.email ?? "—"}
                      </span>
                    </div>
                  </TableCell>
                  {!isSeller && (
                    <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {sellerNames(order)}
                    </TableCell>
                  )}
                  <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {order.orderNumber ?? order._id}
                  </TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      color={
                        displayStatus(order) === "delivered"
                          ? "success"
                          : displayStatus(order) === "cancelled" ||
                            displayStatus(order) === "returned"
                          ? "error"
                          : displayStatus(order) === "shipped" ||
                            displayStatus(order) === "in_transit"
                          ? "primary"
                          : "warning"
                      }
                    >
                      {displayStatus(order)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      size="sm"
                      color={
                        order.paymentStatus === "paid" ? "success" : "warning"
                      }
                    >
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-gray-800 dark:text-white/90">
                    ₹{Number(displayAmount(order)).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700"
                      >
                        View
                      </button>
                      {isSeller && (
                        <button
                          type="button"
                          onClick={() =>
                            void downloadSellerShippingLabel(
                              order._id,
                              order.orderNumber
                            )
                          }
                          className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-md hover:bg-emerald-700"
                        >
                          Label
                        </button>
                      )}
                      <button
                        onClick={() => openChangeStatus(order)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                      >
                        Change Status
                      </button>
                      {!isSeller && (
                        <button
                          onClick={() => openPaymentStatus(order)}
                          className="px-3 py-1 bg-amber-600 text-white text-xs rounded-md hover:bg-amber-700"
                        >
                          Payment
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          order={selectedOrder}
          isSeller={isSeller}
        />
      )}
      {statusOrder && (
        <ChangeStatusModal
          open={openStatus}
          onClose={() => setOpenStatus(false)}
          order={statusOrder}
          isSeller={isSeller}
          onUpdated={(updated) => {
            setOrders((prev) =>
              prev.map((o) =>
                o._id === updated._id ? normalizeOrder({ ...o, ...updated }) : o
              )
            );
          }}
        />
      )}
      {paymentOrder && !isSeller && (
        <PaymentStatusModal
          open={openPayment}
          onClose={() => setOpenPayment(false)}
          order={paymentOrder}
          onUpdated={(updated) => {
            setOrders((prev) =>
              prev.map((o) =>
                o._id === updated._id ? normalizeOrder({ ...o, ...updated }) : o
              )
            );
          }}
        />
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center border-t border-white/70 p-4 dark:border-white/[0.05]">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
