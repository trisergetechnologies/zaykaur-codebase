import Notification from "../models/Notification.js";

/**
 * Creates a notification and returns it.
 * Can be extended to emit via WebSocket/SSE or push notification.
 */
export async function createNotification({ userId, type, title, body, metadata, link }) {
  const notification = await Notification.create({
    userId,
    type,
    title,
    body: body || "",
    metadata: metadata || {},
    link: link || null,
  });

  return notification;
}

export async function notifyOrderPlaced(userId, order) {
  return createNotification({
    userId,
    type: "order_placed",
    title: "Order Placed",
    body: `Your order ${order.orderNumber} has been placed successfully.`,
    metadata: { orderId: order._id, orderNumber: order.orderNumber },
    link: `/my-orders/${order._id}`,
  });
}

export async function notifyOrderStatusChange(userId, order, newStatus) {
  const statusLabels = {
    confirmed: "Order Confirmed",
    packed: "Order Packed",
    shipped: "Order Shipped",
    in_transit: "Order In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Order Delivered",
    cancelled: "Order Cancelled",
    returned: "Order Returned",
  };

  return createNotification({
    userId,
    type: `order_${newStatus}`,
    title: statusLabels[newStatus] || `Order ${newStatus}`,
    body: `Your order ${order.orderNumber} is now ${newStatus.replace(/_/g, " ")}.`,
    metadata: { orderId: order._id, orderNumber: order.orderNumber, status: newStatus },
    link: `/my-orders/${order._id}`,
  });
}

export async function notifyPaymentReceived(userId, order) {
  return createNotification({
    userId,
    type: "payment_received",
    title: "Payment Received",
    body: `Payment for order ${order.orderNumber} has been received.`,
    metadata: { orderId: order._id, orderNumber: order.orderNumber },
  });
}

export async function notifySellerApproval(userId, status, note) {
  return createNotification({
    userId,
    type: status === "approved" ? "seller_approved" : "seller_rejected",
    title: `Seller Application ${status === "approved" ? "Approved" : "Rejected"}`,
    body: note || `Your seller application has been ${status}.`,
    metadata: { status },
  });
}

export async function notifyLowStock(userId, productName, sku, stock) {
  return createNotification({
    userId,
    type: "low_stock",
    title: "Low Stock Alert",
    body: `${productName} (SKU: ${sku}) has only ${stock} units left.`,
    metadata: { productName, sku, stock },
  });
}

export async function notifyReviewReceived(sellerId, productName, rating) {
  return createNotification({
    userId: sellerId,
    type: "review_received",
    title: "New Review",
    body: `${productName} received a ${rating}-star review.`,
    metadata: { productName, rating },
  });
}
