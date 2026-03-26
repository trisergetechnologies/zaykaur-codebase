import test from "node:test";
import assert from "node:assert/strict";

import {
  slugify,
  validateCategoryRequiredVariantAttributes,
  validateOnboardingDocuments,
} from "../src/lib/sellerProductValidation.js";

test("slugify creates stable URL slug", () => {
  assert.equal(slugify("  My Test Shop  "), "my-test-shop");
  assert.equal(slugify("A@B#C"), "abc");
});

test("validateOnboardingDocuments requires gstin, pan and bank docs", () => {
  const invalid = validateOnboardingDocuments([
    { documentType: "gstin", documentUrl: "https://example.com/gst.pdf" },
    { documentType: "pan", documentUrl: "https://example.com/pan.pdf" },
  ]);
  assert.equal(invalid.ok, false);

  const valid = validateOnboardingDocuments([
    { documentType: "gstin", documentUrl: "https://example.com/gst.pdf" },
    { documentType: "pan", documentUrl: "https://example.com/pan.pdf" },
    { documentType: "bank", documentUrl: "https://example.com/bank.pdf" },
  ]);
  assert.equal(valid.ok, true);
});

test("validateCategoryRequiredVariantAttributes enforces template keys", () => {
  const category = {
    variantAttributeTemplates: [{ key: "size" }, { key: "color" }],
  };

  const invalid = validateCategoryRequiredVariantAttributes(category, [
    { attributes: { size: "M" } },
  ]);
  assert.equal(invalid.ok, false);

  const valid = validateCategoryRequiredVariantAttributes(category, [
    { attributes: { size: "M", color: "Blue" } },
    { attributes: { size: "L", color: "Black" } },
  ]);
  assert.equal(valid.ok, true);
});
