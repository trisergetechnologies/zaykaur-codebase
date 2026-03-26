/**
 * Backend variant resolution and selector computation.
 * All variant logic stays in backend - frontend only renders and sends back selections.
 */

/**
 * Compute variantSelectors from product.variantAttributeDefs or derive from variants.
 * Each selector has: { key, label, options: [{ value, inStock }] }
 * Frontend renders these as dropdowns/buttons; no logic needed.
 * @param {import('../models/Product.js').Product} product
 * @returns {{ key: string; label: string; options: { value: string; inStock: boolean }[] }[]}
 */
export function computeVariantSelectors(product) {
  if (!product?.variants?.length) return [];

  const defs = product.variantAttributeDefs;
  const variants = product.variants.filter((v) => v.isActive !== false);

  if (defs?.length > 0) {
    return defs
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((def) => {
        const options = (def.options || []).map((value) => {
          const inStock = variants.some((v) => {
            const attrs = v.attributes || {};
            return attrs[def.key] === value && (v.stock ?? 0) > 0;
          });
          return { value, inStock };
        });
        return { key: def.key, label: def.label || def.key, options };
      });
  }

  // Derive from variants when variantAttributeDefs is empty
  const keysSeen = new Set();
  const keyOrder = [];
  for (const v of variants) {
    const attrs = v.attributes || {};
    for (const k of Object.keys(attrs)) {
      if (!keysSeen.has(k)) {
        keysSeen.add(k);
        keyOrder.push(k);
      }
    }
  }

  return keyOrder.map((key) => {
    const values = [...new Set(variants.map((v) => (v.attributes || {})[key]).filter(Boolean))];
    const options = values.map((value) => {
      const inStock = variants.some((v) => (v.attributes || {})[key] === value && (v.stock ?? 0) > 0);
      return { value, inStock };
    });
    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1").trim();
    return { key, label, options };
  });
}

/**
 * Resolve variantAttributes to variant. Accepts either variantId or variantAttributes.
 * Backend resolves; frontend sends simple object.
 * @param {import('../models/Product.js').Product} product
 * @param {string|null} variantId - optional direct variantId
 * @param {Record<string,string>} variantAttributes - e.g. { ram: "8GB", storage: "256GB" }
 * @returns {{ variant: import('mongoose').Types.Subdocument|null; variantId: string|null }}
 */
export function resolveVariant(product, variantId, variantAttributes = {}) {
  if (!product?.variants?.length) return { variant: null, variantId: null };

  if (variantId) {
    const v = product.variants.id(variantId);
    if (v && v.isActive !== false) return { variant: v, variantId: v._id.toString() };
  }

  if (variantAttributes && Object.keys(variantAttributes).length > 0) {
    const v = product.variants.find((vr) => {
      const attrs = vr.attributes || {};
      return Object.entries(variantAttributes).every(([k, val]) => attrs[k] === val);
    });
    if (v && v.isActive !== false) return { variant: v, variantId: v._id.toString() };
  }

  const first = product.variants.find((vr) => vr.isActive !== false);
  return first ? { variant: first, variantId: first._id.toString() } : { variant: null, variantId: null };
}
