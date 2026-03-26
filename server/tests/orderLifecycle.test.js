import test from "node:test";
import assert from "node:assert/strict";

import {
  canTransitionOrderStatus,
  canTransitionPaymentStatus,
  deriveOrderStatusFromShipments,
} from "../src/lib/orderLifecycle.js";

test("order status transitions are enforced", () => {
  assert.equal(canTransitionOrderStatus("placed", "confirmed"), true);
  assert.equal(canTransitionOrderStatus("placed", "shipped"), false);
  assert.equal(canTransitionOrderStatus("delivered", "returned"), true);
  assert.equal(canTransitionOrderStatus("cancelled", "placed"), false);
});

test("payment status transitions are enforced", () => {
  assert.equal(canTransitionPaymentStatus("pending", "paid"), true);
  assert.equal(canTransitionPaymentStatus("paid", "failed"), false);
  assert.equal(canTransitionPaymentStatus("paid", "refunded"), true);
});

test("deriveOrderStatusFromShipments reflects shipment progress", () => {
  assert.equal(deriveOrderStatusFromShipments([], "placed"), "placed");
  assert.equal(
    deriveOrderStatusFromShipments([{ status: "shipped" }, { status: "packed" }], "placed"),
    "shipped"
  );
  assert.equal(
    deriveOrderStatusFromShipments([{ status: "delivered" }, { status: "delivered" }], "shipped"),
    "delivered"
  );
  assert.equal(
    deriveOrderStatusFromShipments([{ status: "returned" }, { status: "delivered" }], "delivered"),
    "returned"
  );
});
