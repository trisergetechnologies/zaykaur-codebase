export const ORDER_STATUS_FLOW = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["in_transit", "returned"],
  in_transit: ["out_for_delivery", "returned"],
  out_for_delivery: ["delivered", "returned"],
  delivered: ["returned"],
  returned: [],
  cancelled: [],
};

export const PAYMENT_STATUS_FLOW = {
  pending: ["paid", "failed"],
  paid: ["refunded"],
  failed: ["pending"],
  refunded: [],
};

export const canTransitionOrderStatus = (currentStatus, nextStatus) => {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true;
  const allowed = ORDER_STATUS_FLOW[currentStatus] || [];
  return allowed.includes(nextStatus);
};

export const canTransitionPaymentStatus = (currentStatus, nextStatus) => {
  if (!currentStatus || !nextStatus) return false;
  if (currentStatus === nextStatus) return true;
  const allowed = PAYMENT_STATUS_FLOW[currentStatus] || [];
  return allowed.includes(nextStatus);
};

export const applyOrderStatusTimestamps = (order, nextStatus, now = new Date()) => {
  if (nextStatus === "confirmed" && !order.confirmedAt) order.confirmedAt = now;
  if (nextStatus === "shipped" && !order.shippedAt) order.shippedAt = now;
  if (nextStatus === "delivered" && !order.deliveredAt) order.deliveredAt = now;
  if (nextStatus === "returned" && !order.returnedAt) order.returnedAt = now;
};

export const deriveOrderStatusFromShipments = (shipments = [], fallbackStatus = "placed") => {
  if (!Array.isArray(shipments) || shipments.length === 0) {
    return fallbackStatus;
  }

  const statuses = shipments.map((shipment) => shipment.status);
  if (statuses.some((status) => status === "returned")) return "returned";
  if (statuses.every((status) => status === "delivered")) return "delivered";
  if (statuses.some((status) => status === "out_for_delivery")) return "out_for_delivery";
  if (statuses.some((status) => status === "in_transit")) return "in_transit";
  if (statuses.some((status) => status === "shipped")) return "shipped";
  if (statuses.some((status) => status === "packed")) return "packed";
  if (statuses.some((status) => status === "confirmed")) return "confirmed";
  if (statuses.every((status) => status === "cancelled")) return "cancelled";
  return "placed";
};
