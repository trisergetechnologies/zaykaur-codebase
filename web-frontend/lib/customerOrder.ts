/**
 * Normalizes customer order payloads from GET /api/v1/customer/order and GET .../order/:id
 * for consistent UI. Field names match server Order model where possible.
 */

export type OrderLineItemView = {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  /** List / MRP when higher than selling price (display only) */
  mrp?: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  image?: string;
  slug?: string;
};

export type AddressView = {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type ShipmentEventView = {
  at: string;
  status?: string;
  location?: string;
  description?: string;
};

export type ShipmentView = {
  id: string;
  status: string;
  carrierName?: string;
  carrierCode?: string;
  awbNumber?: string;
  trackingUrl?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  events: ShipmentEventView[];
};

export type CustomerOrderListItem = {
  id: string;
  orderNumber: string;
  createdAt: string;
  grandTotal: number;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  itemCount: number;
  previewImages: string[];
  items: OrderLineItemView[];
};

export type CustomerOrderDetail = CustomerOrderListItem & {
  subtotal: number;
  taxTotal: number;
  shippingAmount: number;
  discountTotal: number;
  couponCode?: string;
  currency: string;
  paymentId?: string;
  paidAt?: string;
  shippingAddress?: AddressView;
  billingAddress?: AddressView;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  returnedAt?: string;
  shipments: ShipmentView[];
};

const PLACEHOLDER_IMG = "/placeholder-product.png";

function lineItemFromApi(item: any, index: number): OrderLineItemView {
  const snap = item.productSnapshot;
  return {
    id: String(
      item._id ?? `${item.productId ?? "p"}-${item.variantId ?? "v"}-${index}`
    ),
    productId: String(item.productId ?? ""),
    variantId: item.variantId ? String(item.variantId) : undefined,
    name: item.name || snap?.name || "Product",
    sku: item.sku || "—",
    quantity: item.quantity ?? 0,
    unitPrice: Number(item.unitPrice ?? 0),
    taxRate: Number(item.taxRate ?? 0),
    taxAmount: Number(item.taxAmount ?? 0),
    lineTotal: Number(item.lineTotal ?? (item.unitPrice ?? 0) * (item.quantity ?? 0)),
    image: snap?.image || PLACEHOLDER_IMG,
    slug: snap?.slug,
    mrp: item.mrp != null && item.mrp > 0 ? Number(item.mrp) : undefined,
  };
}

function mapAddress(a: any): AddressView | undefined {
  if (!a) return undefined;
  return {
    fullName: a.fullName || "",
    phone: a.phone || "",
    street: a.street || "",
    city: a.city || "",
    state: a.state || "",
    postalCode: a.postalCode || "",
    country: a.country || "India",
  };
}

export function mapCustomerOrderListItem(o: any): CustomerOrderListItem {
  const items = (o.items ?? []).map((item: any, i: number) => lineItemFromApi(item, i));
  const previewImages = items
    .map((it: OrderLineItemView) => it.image)
    .filter(Boolean)
    .slice(0, 4) as string[];

  return {
    id: String(o._id ?? o.id ?? ""),
    orderNumber: o.orderNumber || String(o._id ?? ""),
    createdAt: o.createdAt || new Date().toISOString(),
    grandTotal: Number(o.grandTotal ?? o.total ?? 0),
    orderStatus: (o.orderStatus || o.status || "placed").toLowerCase(),
    paymentMethod: o.paymentMethod || "cod",
    paymentStatus: (o.paymentStatus || "pending").toLowerCase(),
    itemCount: items.reduce(
      (n: number, it: OrderLineItemView) => n + it.quantity,
      0
    ),
    previewImages,
    items,
  };
}

function mapShipment(s: any, i: number): ShipmentView {
  return {
    id: String(s._id ?? `sh-${i}`),
    status: (s.status || "placed").toLowerCase(),
    carrierName: s.carrierName,
    carrierCode: s.carrierCode,
    awbNumber: s.awbNumber,
    trackingUrl: s.trackingUrl,
    dispatchedAt: s.dispatchedAt,
    deliveredAt: s.deliveredAt,
    events: Array.isArray(s.events)
      ? s.events.map((e: any) => ({
          at: e.at,
          status: e.status,
          location: e.location,
          description: e.description,
        }))
      : [],
  };
}

export function mapCustomerOrderDetail(o: any): CustomerOrderDetail {
  const base = mapCustomerOrderListItem(o);
  const shipments = Array.isArray(o.shipments) ? o.shipments.map(mapShipment) : [];

  return {
    ...base,
    subtotal: Number(o.subtotal ?? 0),
    taxTotal: Number(o.taxTotal ?? 0),
    shippingAmount: Number(o.shippingAmount ?? 0),
    discountTotal: Number(o.discountTotal ?? 0),
    couponCode: o.couponCode ? String(o.couponCode) : "",
    currency: o.currency || "INR",
    paymentId: o.paymentId,
    paidAt: o.paidAt,
    shippingAddress: mapAddress(o.shippingAddress),
    billingAddress: mapAddress(o.billingAddress),
    confirmedAt: o.confirmedAt,
    shippedAt: o.shippedAt,
    deliveredAt: o.deliveredAt,
    returnedAt: o.returnedAt,
    shipments,
  };
}

export function formatPaymentMethodLabel(method: string): string {
  const m = (method || "").toLowerCase();
  if (m === "cod") return "Cash on Delivery";
  if (m === "online") return "UPI / Card / Net Banking";
  if (m === "wallet") return "Wallet";
  return method || "—";
}

export function formatPaymentStatusLabel(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "pending") return "Pending";
  if (s === "paid") return "Paid";
  if (s === "failed") return "Failed";
  if (s === "refunded") return "Refunded";
  return status || "—";
}

/** Canonical progression for the visual timeline (subset of server enum). */
export const ORDER_TIMELINE_STEPS = [
  { key: "placed", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "in_transit", label: "In transit" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
] as const;

const STATUS_ORDER: Record<string, number> = ORDER_TIMELINE_STEPS.reduce(
  (acc, step, i) => {
    acc[step.key] = i;
    return acc;
  },
  {} as Record<string, number>
);

export function orderStatusIndex(status: string): number {
  const s = (status || "placed").toLowerCase();
  if (s === "cancelled" || s === "returned") return -1;
  return STATUS_ORDER[s] ?? 0;
}

export function isTerminalProblemStatus(status: string): boolean {
  const s = (status || "").toLowerCase();
  return s === "cancelled" || s === "returned";
}
