import nodemailer from "nodemailer";
import logger from "../logger.js";

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

const from = () => process.env.SMTP_FROM || "ZayKaur <noreply@zaykaur.com>";

export async function sendEmail({ to, subject, html, text, cc, bcc }) {
  if (!to) {
    logger.warn({ to }, "sendEmail: no recipient, skip");
    return { skipped: true };
  }
  if (!process.env.SMTP_USER) {
    logger.warn({ to, subject }, "SMTP not configured, skip email");
    return { skipped: true, reason: "no_smtp" };
  }
  try {
    const info = await getTransporter().sendMail({
      from: from(),
      to,
      subject,
      html,
      text: text || undefined,
      cc: cc || undefined,
      bcc: bcc || undefined,
    });
    logger.info({ to, subject, messageId: info.messageId }, "email sent");
    return info;
  } catch (err) {
    logger.error({ to, subject, err: err.message, code: err.code }, "email send FAILED");
    throw err;
  }
}
