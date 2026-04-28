import { randomUUID } from "crypto";

const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Fire-and-forget publish to notification-service. Never throws to callers.
 * @param {{ eventType: string, data?: object, eventId?: string }} payload
 */
export function publishNotification(payload) {
  const { eventType, data = {}, eventId } = payload;
  const baseUrl = process.env.NOTIFICATION_SERVICE_URL?.trim();
  const secret = process.env.NOTIFICATION_SERVICE_SECRET?.trim();

  if (!baseUrl || !secret) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[notification] NOTIFICATION_SERVICE_URL or NOTIFICATION_SERVICE_SECRET unset; skip",
        eventType
      );
    }
    return Promise.resolve();
  }

  const url = `${baseUrl.replace(/\/$/, "")}/events`;
  const body = JSON.stringify({
    eventId: eventId || randomUUID(),
    eventType,
    occurredAt: new Date().toISOString(),
    source: "server",
    data,
  });

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), DEFAULT_TIMEOUT_MS);

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Notification-Secret": secret,
    },
    body,
    signal: ac.signal,
  })
    .then((res) => {
      if (!res.ok) {
        console.warn("[notification] HTTP", res.status, eventType);
      }
    })
    .catch((err) => {
      console.warn("[notification] failed:", eventType, err.message);
    })
    .finally(() => clearTimeout(timer));
}
