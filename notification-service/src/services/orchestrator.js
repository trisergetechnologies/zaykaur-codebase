import logger from "../logger.js";
import { sendEmail } from "../providers/email.js";
import { sendPush } from "../providers/push.stub.js";
import { templates } from "../templates/emails.js";

function adminCc() {
  const e = process.env.ADMIN_ALERT_EMAIL?.trim();
  return e || undefined;
}

/**
 * @param {{ eventType: string, eventId: string, data?: object }} event
 */
export async function handleEvent(event) {
  const { eventType, eventId, data = {} } = event;
  const cc = adminCc();

  logger.info({ eventId, eventType }, "orchestrator: handling event");

  await sendPush(event).catch((err) =>
    logger.warn({ err: err.message, eventId }, "push stub failed")
  );

  switch (eventType) {
    case "order.placed": {
      const u = data.user || {};
      if (!u.email) break;
      const { subject, html } = templates.orderPlaced({
        userName: u.name,
        orderNumber: data.orderNumber,
        grandTotal: data.grandTotal,
        currency: data.currency,
      });
      await sendEmail({ to: u.email, subject, html, cc });
      break;
    }
    case "order.status.delivered": {
      const u = data.user || {};
      if (!u.email) break;
      const { subject, html } = templates.orderDelivered({
        userName: u.name,
        orderNumber: data.orderNumber,
      });
      await sendEmail({ to: u.email, subject, html });
      break;
    }
    case "order.status.cancelled": {
      const u = data.user || {};
      if (!u.email) break;
      const { subject, html } = templates.orderCancelled({
        userName: u.name,
        orderNumber: data.orderNumber,
      });
      await sendEmail({ to: u.email, subject, html });
      break;
    }
    case "order.status.returned": {
      const u = data.user || {};
      if (!u.email) break;
      const { subject, html } = templates.orderReturned({
        userName: u.name,
        orderNumber: data.orderNumber,
      });
      await sendEmail({ to: u.email, subject, html });
      break;
    }
    case "order.payment.refunded": {
      const u = data.user || {};
      if (!u.email) break;
      const { subject, html } = templates.paymentRefunded({
        userName: u.name,
        orderNumber: data.orderNumber,
      });
      await sendEmail({ to: u.email, subject, html });
      break;
    }
    case "order.return.requested": {
      const u = data.user || {};
      if (!u.email) break;
      const { subject, html } = templates.returnRequested({
        userName: u.name,
        orderNumber: data.orderNumber,
        returnId: data.returnId,
      });
      await sendEmail({ to: u.email, subject, html });
      break;
    }
    case "order.return.completed": {
      const u = data.user || {};
      if (!u.email) break;
      const { subject, html } = templates.returnCompleted({
        userName: u.name,
        orderNumber: data.orderNumber,
      });
      await sendEmail({ to: u.email, subject, html });
      break;
    }
    case "product.stock.low": {
      const s = data.seller || {};
      if (!s.email) {
        logger.warn({ eventId }, "product.stock.low: no seller email");
        break;
      }
      const { subject, html } = templates.productStockLow({
        sellerName: s.name,
        productName: data.productName,
        sku: data.sku,
        stock: data.stock,
      });
      await sendEmail({
        to: s.email,
        subject,
        html,
        cc: cc || undefined,
      });
      break;
    }
    default:
      logger.warn({ eventType, eventId }, "unknown eventType — no handler");
  }
}
