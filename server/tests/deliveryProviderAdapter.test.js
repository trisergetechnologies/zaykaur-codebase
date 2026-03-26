import test from "node:test";
import assert from "node:assert/strict";

import { createProviderShipment } from "../src/lib/deliveryProviderAdapter.js";

test("createProviderShipment returns null for non-integrated provider", async () => {
  const result = await createProviderShipment({
    provider: { isIntegrated: false, code: "MANUAL" },
    order: { orderNumber: "ZK-1" },
    sellerId: "seller-1",
  });
  assert.equal(result, null);
});

test("createProviderShipment generates AWB and tracking URL", async () => {
  const result = await createProviderShipment({
    provider: { isIntegrated: true, code: "DELHIVERY", webhookUrl: "https://track.example.com" },
    order: { orderNumber: "ZK-2001" },
    sellerId: "seller-2",
  });

  assert.equal(typeof result.awbNumber, "string");
  assert.match(result.awbNumber, /^DELHIVERY-/);
  assert.match(result.trackingUrl, /track\.example\.com/);
});
