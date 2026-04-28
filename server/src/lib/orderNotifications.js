import Product from "../models/Product.js";
import User from "../models/User.js";
import { publishNotification } from "./notificationClient.js";

const LOW_STOCK_THRESHOLD = 5;

function fire(promise) {
  promise.catch(() => {});
}

export function notifyOrderPlaced(order, userDoc) {
  fire(
    publishNotification({
      eventType: "order.placed",
      data: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        grandTotal: order.grandTotal,
        currency: order.currency || "INR",
        user: {
          id: String(userDoc._id),
          email: userDoc.email,
          name: userDoc.name,
        },
      },
    })
  );
}

export async function notifyOrderStatusChange(prevStatus, nextStatus, order) {
  if (!nextStatus || prevStatus === nextStatus) return;
  const map = {
    delivered: "order.status.delivered",
    cancelled: "order.status.cancelled",
    returned: "order.status.returned",
  };
  const eventType = map[nextStatus];
  if (!eventType) return;

  const user = await User.findById(order.userId).select("name email").lean();
  if (!user?.email) return;

  fire(
    publishNotification({
      eventType,
      data: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        user: {
          id: String(user._id),
          email: user.email,
          name: user.name,
        },
      },
    })
  );
}

export async function notifyPaymentRefunded(prevStatus, nextStatus, order) {
  if (nextStatus !== "refunded" || prevStatus === nextStatus) return;

  const user = await User.findById(order.userId).select("name email").lean();
  if (!user?.email) return;

  fire(
    publishNotification({
      eventType: "order.payment.refunded",
      data: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        user: {
          id: String(user._id),
          email: user.email,
          name: user.name,
        },
      },
    })
  );
}

export async function notifyReturnRequested(returnReq, order) {
  const user = await User.findById(returnReq.userId).select("name email").lean();
  if (!user?.email) return;

  fire(
    publishNotification({
      eventType: "order.return.requested",
      data: {
        returnId: String(returnReq._id),
        orderId: String(returnReq.orderId),
        orderNumber: order?.orderNumber,
        user: {
          id: String(user._id),
          email: user.email,
          name: user.name,
        },
      },
    })
  );
}

export async function notifyReturnRefundCompleted(returnReq, order) {
  const user = await User.findById(returnReq.userId).select("name email").lean();
  if (!user?.email) return;

  fire(
    publishNotification({
      eventType: "order.return.completed",
      data: {
        returnId: String(returnReq._id),
        orderId: String(returnReq.orderId),
        orderNumber: order?.orderNumber,
        user: {
          id: String(user._id),
          email: user.email,
          name: user.name,
        },
      },
    })
  );
}

/**
 * After checkout stock decrement — alert seller if variant is at or below threshold.
 */
export async function notifyLowStockAfterDecrement(productId, variantId) {
  const fresh = await Product.findById(productId).select("name seller variants").lean();
  if (!fresh) return;
  const v = fresh.variants.find((x) => String(x._id) === String(variantId));
  if (!v || v.stock > LOW_STOCK_THRESHOLD) return;

  const seller = await User.findById(fresh.seller).select("name email").lean();
  if (!seller?.email) return;

  fire(
    publishNotification({
      eventType: "product.stock.low",
      data: {
        seller: {
          id: String(seller._id),
          email: seller.email,
          name: seller.name,
        },
        productId: String(productId),
        variantId: String(variantId),
        productName: fresh.name,
        sku: v.sku,
        stock: v.stock,
      },
    })
  );
}

/**
 * Seller manually updated stock — only when crossing into low band (was strictly above threshold).
 */
export function notifyInventoryLowStockIfCrossed(prevStock, nextStock, productName, sellerId, variantMeta) {
  if (!(prevStock > LOW_STOCK_THRESHOLD && nextStock <= LOW_STOCK_THRESHOLD)) return;

  fire(
    (async () => {
      const seller = await User.findById(sellerId).select("name email").lean();
      if (!seller?.email) return;
      await publishNotification({
        eventType: "product.stock.low",
        data: {
          seller: {
            id: String(seller._id),
            email: seller.email,
            name: seller.name,
          },
          productId: variantMeta.productId,
          variantId: variantMeta.variantId,
          productName,
          sku: variantMeta.sku,
          stock: nextStock,
        },
      });
    })()
  );
}
