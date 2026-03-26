import test from "node:test";
import assert from "node:assert/strict";

import {
  buildPeriodKey,
  buildTaxBreakdown,
  getOrderReturnedFlag,
  normalizeReportPeriod,
} from "../src/lib/reportingHelpers.js";

test("normalizeReportPeriod falls back to monthly", () => {
  assert.equal(normalizeReportPeriod(), "monthly");
  assert.equal(normalizeReportPeriod("unknown"), "monthly");
  assert.equal(normalizeReportPeriod("weekly"), "weekly");
});

test("buildPeriodKey supports monthly and weekly", () => {
  const date = new Date("2026-03-05T00:00:00Z");
  assert.equal(buildPeriodKey(date, "monthly"), "2026-03");
  assert.match(buildPeriodKey(date, "weekly"), /^2026-W\d{2}$/);
});

test("getOrderReturnedFlag detects seller return status", () => {
  const shipments = [
    { sellerId: "seller-a", status: "shipped" },
    { sellerId: "seller-b", status: "returned" },
  ];

  assert.equal(getOrderReturnedFlag("placed", shipments, "seller-a"), false);
  assert.equal(getOrderReturnedFlag("placed", shipments, "seller-b"), true);
  assert.equal(getOrderReturnedFlag("returned", shipments, "seller-a"), true);
});

test("buildTaxBreakdown groups by tax type and code", () => {
  const map = new Map([
    ["GST12", { code: "GST12", type: "gst" }],
    ["IGST18", { code: "IGST18", type: "igst" }],
  ]);
  const breakdown = buildTaxBreakdown(
    [
      { taxCode: "GST12", taxRate: 12, taxAmount: 24 },
      { taxCode: "GST12", taxRate: 12, taxAmount: 36 },
      { taxCode: "IGST18", taxRate: 18, taxAmount: 54 },
    ],
    map
  );

  assert.equal(breakdown.length, 2);
  assert.deepEqual(
    breakdown.find((entry) => entry.code === "GST12"),
    { type: "gst", code: "GST12", rate: 12, amount: 60 }
  );
  assert.deepEqual(
    breakdown.find((entry) => entry.code === "IGST18"),
    { type: "igst", code: "IGST18", rate: 18, amount: 54 }
  );
});
