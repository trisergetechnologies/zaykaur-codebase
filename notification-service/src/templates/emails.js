const wrap = (title, body) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  <h2 style="margin-top:0">${title}</h2>
  ${body}
  <p style="color:#666;font-size:12px;margin-top:24px">— ZayKaur</p>
</div>`;

export const templates = {
  orderPlaced(d) {
    const sub = wrap(
      "Order confirmed",
      `<p>Hi ${escapeHtml(d.userName || "there")},</p>
       <p>Thank you for your purchase. Order <strong>${escapeHtml(d.orderNumber)}</strong> has been placed successfully.</p>
       <p><strong>Total:</strong> ${escapeHtml(String(d.currency || "INR"))} ${escapeHtml(String(d.grandTotal ?? ""))}</p>
       <p>We will notify you when your order ships.</p>`
    );
    return { subject: `Order confirmed — ${d.orderNumber}`, html: sub };
  },

  orderDelivered(d) {
    const sub = wrap(
      "Delivered",
      `<p>Hi ${escapeHtml(d.userName || "there")},</p>
       <p>Your order <strong>${escapeHtml(d.orderNumber)}</strong> has been marked as delivered.</p>
       <p>Thank you for shopping with ZayKaur.</p>`
    );
    return { subject: `Delivered — ${d.orderNumber}`, html: sub };
  },

  orderCancelled(d) {
    const sub = wrap(
      "Order cancelled",
      `<p>Hi ${escapeHtml(d.userName || "there")},</p>
       <p>Your order <strong>${escapeHtml(d.orderNumber)}</strong> has been cancelled.</p>`
    );
    return { subject: `Order cancelled — ${d.orderNumber}`, html: sub };
  },

  orderReturned(d) {
    const sub = wrap(
      "Order returned",
      `<p>Hi ${escapeHtml(d.userName || "there")},</p>
       <p>Your order <strong>${escapeHtml(d.orderNumber)}</strong> has been marked as returned.</p>`
    );
    return { subject: `Return recorded — ${d.orderNumber}`, html: sub };
  },

  paymentRefunded(d) {
    const sub = wrap(
      "Refund processed",
      `<p>Hi ${escapeHtml(d.userName || "there")},</p>
       <p>A refund has been processed for order <strong>${escapeHtml(d.orderNumber)}</strong>.</p>`
    );
    return { subject: `Refund — ${d.orderNumber}`, html: sub };
  },

  returnRequested(d) {
    const sub = wrap(
      "Return request received",
      `<p>Hi ${escapeHtml(d.userName || "there")},</p>
       <p>We received your return request for order <strong>${escapeHtml(d.orderNumber)}</strong>.</p>
       <p>Return ID: <strong>${escapeHtml(d.returnId || "")}</strong></p>`
    );
    return { subject: `Return request — ${d.orderNumber}`, html: sub };
  },

  returnCompleted(d) {
    const sub = wrap(
      "Refund completed",
      `<p>Hi ${escapeHtml(d.userName || "there")},</p>
       <p>Your refund for order <strong>${escapeHtml(d.orderNumber)}</strong> has been completed.</p>`
    );
    return { subject: `Refund completed — ${d.orderNumber}`, html: sub };
  },

  productStockLow(d) {
    const sub = wrap(
      "Low stock alert",
      `<p>Hi ${escapeHtml(d.sellerName || "Seller")},</p>
       <p>Variant <strong>${escapeHtml(d.sku || "—")}</strong> of product <strong>${escapeHtml(d.productName || "")}</strong> is low on stock.</p>
       <p><strong>Remaining:</strong> ${escapeHtml(String(d.stock ?? ""))}</p>
       <p>Please update inventory in your seller dashboard.</p>`
    );
    return {
      subject: `Low stock: ${d.productName || "Product"}`,
      html: sub,
    };
  },
};

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
