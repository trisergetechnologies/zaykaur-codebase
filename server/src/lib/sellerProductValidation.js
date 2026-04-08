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
  if (!Array.isArray(documents) || documents.length < 4) {
    return {
      ok: false,
      message:
        "Required documents are missing (gstin, pan, aadhaar and passbook/bank_statement)",
    };
  }

  const required = new Set(["gstin", "pan", "aadhaar"]);
  const available = new Set(
    documents
      .map((document) => String(document?.documentType || "").toLowerCase().trim())
      .filter(Boolean)
  );

  for (const type of required) {
    if (!available.has(type)) {
      return {
        ok: false,
        message: `Missing required '${type}' document`,
      };
    }
  }

  if (!available.has("passbook") && !available.has("bank_statement")) {
    return {
      ok: false,
      message: "Either 'passbook' or 'bank_statement' document is required",
    };
  }

  const hasMissingUrl = documents.some((document) => !document?.documentUrl);
  if (hasMissingUrl) {
    return { ok: false, message: "Each document must include documentUrl" };
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
