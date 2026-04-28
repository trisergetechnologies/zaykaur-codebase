import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { createServer } from "node:http";

process.env.NOTIFICATION_SERVICE_SECRET = "test-secret-contract";

const { createApp } = await import("../src/app.js");

function listen(app) {
  return new Promise((resolve, reject) => {
    const server = createServer(app);
    server.listen(0, "127.0.0.1", () => resolve(server));
    server.on("error", reject);
  });
}

describe("POST /events contract", async () => {
  const app = createApp();
  let server;
  let baseUrl;

  before(async () => {
    server = await listen(app);
    const addr = server.address();
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(() => server?.close());

  test("401 without secret", async () => {
    const res = await fetch(`${baseUrl}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: "e1",
        eventType: "order.placed",
        data: {},
      }),
    });
    assert.equal(res.status, 401);
  });

  test("400 missing eventType", async () => {
    const res = await fetch(`${baseUrl}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Notification-Secret": "test-secret-contract",
      },
      body: JSON.stringify({
        eventId: "e-missing-type",
      }),
    });
    assert.equal(res.status, 400);
  });

  test("202 accepted order.placed", async () => {
    const res = await fetch(`${baseUrl}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Notification-Secret": "test-secret-contract",
      },
      body: JSON.stringify({
        eventId: "evt-unique-001",
        eventType: "order.placed",
        occurredAt: new Date().toISOString(),
        source: "server",
        data: {
          orderNumber: "ZK-TEST-1",
          grandTotal: 100,
          currency: "INR",
          user: { email: "buyer@test.local", name: "Buyer" },
        },
      }),
    });
    assert.equal(res.status, 202);
    const json = await res.json();
    assert.equal(json.success, true);
  });

  test("202 duplicate eventId idempotent", async () => {
    const id = "evt-dedupe-xyz";
    const body = {
      eventId: id,
      eventType: "order.placed",
      data: {
        orderNumber: "ZK-D",
        user: { email: "x@test.local", name: "X" },
      },
    };
    const headers = {
      "Content-Type": "application/json",
      "X-Notification-Secret": "test-secret-contract",
    };
    const r1 = await fetch(`${baseUrl}/events`, { method: "POST", headers, body: JSON.stringify(body) });
    assert.equal(r1.status, 202);
    const r2 = await fetch(`${baseUrl}/events`, { method: "POST", headers, body: JSON.stringify(body) });
    assert.equal(r2.status, 202);
    const j2 = await r2.json();
    assert.equal(j2.duplicate, true);
  });
});
