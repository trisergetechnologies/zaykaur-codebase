export const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const validateCategoryRequiredVariantAttributes = (category, variants = []) => {
  const requiredKeys = (category?.variantAttributeTemplates || [])
    .map((template) => String(template?.key || "").trim())
    .filter(Boolean);

  if (!requiredKeys.length) {
    return { ok: true, message: "" };
  }

  for (const variant of variants) {
    const attrs = variant?.attributes || {};
    for (const key of requiredKeys) {
      if (attrs[key] == null || attrs[key] === "") {
        return {
          ok: false,
          message: `Missing required variant attribute '${key}' for selected category`,
        };
      }
    }
  }

  return { ok: true, message: "" };
};

export const validateOnboardingDocuments = (documents = []) => {
  const requiredTypes = ["gstin", "pan", "aadhaar", "passbook", "bank_statement"];
  if (!Array.isArray(documents) || documents.length < requiredTypes.length) {
    return {
      ok: false,
      message: "Required documents are missing (GSTIN, PAN, Aadhaar, passbook, and bank statement)",
    };
  }

  const available = new Set(
    documents
      .map((document) => String(document?.documentType || "").toLowerCase().trim())
      .filter(Boolean)
  );

  for (const type of requiredTypes) {
    if (!available.has(type)) {
      return {
        ok: false,
        message: `Missing required '${type}' document`,
      };
    }
  }

  const byType = new Map(
    documents.map((d) => [String(d?.documentType || "").toLowerCase().trim(), d])
  );
  for (const type of requiredTypes) {
    const doc = byType.get(type);
    if (!doc?.documentUrl || !String(doc.documentUrl).trim()) {
      return { ok: false, message: `Each document must include a file upload (${type})` };
    }
  }

  return { ok: true, message: "" };
};

export const validateVariantImageLimits = (variants = []) => {
  for (const variant of variants) {
    const count = Array.isArray(variant?.images) ? variant.images.length : 0;
    if (count === 0) {
      return { ok: false, message: "Each variant must include at least one image" };
    }
    if (count > 5) {
      return { ok: false, message: "Each variant can have up to 5 images" };
    }
  }
  return { ok: true, message: "" };
};
