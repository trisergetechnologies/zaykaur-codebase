import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

const FROM = () => process.env.SMTP_FROM || "ZayKaur <noreply@zaykaur.com>";

async function sendMail({ to, subject, html, text }) {
  if (!process.env.SMTP_USER) {
    console.warn("[EmailService] SMTP not configured, skipping email to:", to);
    return null;
  }
  return getTransporter().sendMail({ from: FROM(), to, subject, html, text });
}

export async function sendWelcomeEmail(user) {
  return sendMail({
    to: user.email,
    subject: "Welcome to ZayKaur!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a1a1a">Welcome to ZayKaur, ${user.name}!</h2>
        <p>Thank you for creating an account. Start exploring our marketplace for the best products.</p>
        <p style="color:#666;font-size:12px">If you didn't create this account, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendEmailVerification(user, token) {
  const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;
  return sendMail({
    to: user.email,
    subject: "Verify your email - ZayKaur",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a1a1a">Verify Your Email</h2>
        <p>Hi ${user.name}, click the button below to verify your email address.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">Verify Email</a>
        <p style="color:#666;font-size:12px">This link expires in 24 hours. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(user, token) {
  const url = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;
  return sendMail({
    to: user.email,
    subject: "Reset your password - ZayKaur",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a1a1a">Password Reset</h2>
        <p>Hi ${user.name}, you requested a password reset. Click the button below to set a new password.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:6px;margin:16px 0">Reset Password</a>
        <p style="color:#666;font-size:12px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

export async function sendOrderConfirmation(user, order) {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.productSnapshot?.name || item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${item.lineTotal}</td>
        </tr>`
    )
    .join("");

  return sendMail({
    to: user.email,
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a1a1a">Order Confirmed!</h2>
        <p>Hi ${user.name}, your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#f5f5f5">
            <th style="padding:8px;text-align:left">Item</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="font-size:16px"><strong>Grand Total: ₹${order.grandTotal}</strong></p>
        <p>Payment: ${order.paymentMethod.toUpperCase()}</p>
        <p style="color:#666;font-size:12px">Thank you for shopping with ZayKaur!</p>
      </div>
    `,
  });
}

export async function sendShipmentUpdate(user, order, shipment) {
  return sendMail({
    to: user.email,
    subject: `Shipment Update - ${order.orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a1a1a">Shipment Update</h2>
        <p>Hi ${user.name}, your order <strong>${order.orderNumber}</strong> shipment status is now: <strong>${shipment.status}</strong></p>
        ${shipment.trackingUrl ? `<p><a href="${shipment.trackingUrl}">Track your shipment</a></p>` : ""}
        ${shipment.awbNumber ? `<p>AWB: ${shipment.awbNumber}</p>` : ""}
      </div>
    `,
  });
}

export async function sendSellerApprovalEmail(user, status, note) {
  const statusText = status === "approved" ? "approved" : "rejected";
  return sendMail({
    to: user.email,
    subject: `Seller Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)} - ZayKaur`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#1a1a1a">Seller Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}</h2>
        <p>Hi ${user.name}, your seller application has been <strong>${statusText}</strong>.</p>
        ${note ? `<p>Note: ${note}</p>` : ""}
        ${status === "approved" ? "<p>You can now start listing products on ZayKaur!</p>" : "<p>Please review the feedback and resubmit your application.</p>"}
      </div>
    `,
  });
}
