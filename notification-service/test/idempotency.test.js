import assert from "node:assert/strict";
import { describe, test } from "node:test";

const { isDuplicateEventId } = await import("../src/services/idempotency.js");

describe("idempotency", () => {
  test("first id is not duplicate", () => {
    assert.equal(isDuplicateEventId("a1"), false);
    assert.equal(isDuplicateEventId("a1"), true);
  });
});
