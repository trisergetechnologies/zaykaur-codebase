import Category from "../../models/Category.js";
import Product from "../../models/Product.js";
import TaxRule from "../../models/TaxRule.js";
import { computeVariantSelectors } from "../../lib/variantHelpers.js";
import {
  slugify,
  validateCategoryRequiredVariantAttributes,
  validateVariantImageLimits,
} from "../../lib/sellerProductValidation.js";

/**
 * Only `admin` may create/update listings as live (`active`) without moderation.
 * `seller` and `staff` use the same route (`POST /seller/products`); staff was
 * previously able to bypass moderation because only `seller` was checked — common in production.
 */
const isAdminUser = (user) => String(user?.role ?? "").toLowerCase() === "admin";

const agentLog = (payload) => {
  // #region agent log
  fetch("http://127.0.0.1:7903/ingest/c232eb23-7656-469e-86bf-c4e24659685a", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9435c8" },
    body: JSON.stringify({
      sessionId: "9435c8",
      timestamp: Date.now(),
      ...payload,
    }),
  }).catch(() => {});
  // #endregion
};

const normalizeCategories = (category, categories = []) => {
  const merged = new Set([String(category), ...(categories || []).map((value) => String(value))]);
  return [...merged].filter(Boolean);
};

const validateTaxCode = async (taxCode, categoryId) => {
  if (!taxCode) {
    return { ok: false, message: "taxCode is required for product listing" };
  }

  const taxRule = await TaxRule.findOne({ code: taxCode, isActive: true }).lean();
  if (!taxRule) {
    return { ok: false, message: "Invalid or inactive taxCode" };
  }

  if (taxRule.categoryIds?.length) {
    const appliesToCategory = taxRule.categoryIds.some((id) => String(id) === String(categoryId));
    if (!appliesToCategory) {
      return {
        ok: false,
        message: "Selected taxCode is not applicable for this category",
      };
    }
  }

  return { ok: true, taxRule };
};

const validateProductPayload = async ({
  payload,
  existingProduct = null,
  sellerId,
}) => {
  const data = {
    name: payload.name ?? existingProduct?.name,
    slug: payload.slug ?? existingProduct?.slug ?? slugify(payload.name || existingProduct?.name || ""),
    description: payload.description ?? existingProduct?.description,
    category: payload.category ?? existingProduct?.category,
    categories: payload.categories ?? existingProduct?.categories ?? [],
    brand: payload.brand ?? existingProduct?.brand ?? "",
    status: payload.status ?? existingProduct?.status ?? "draft",
    attributes: payload.attributes ?? existingProduct?.attributes ?? {},
    taxCode: payload.taxCode ?? existingProduct?.taxCode,
    variantAttributeDefs: payload.variantAttributeDefs ?? existingProduct?.variantAttributeDefs ?? [],
    variants: payload.variants ?? existingProduct?.variants,
  };

  if (!data.name || !data.description || !data.category || !Array.isArray(data.variants) || !data.variants.length) {
    return { ok: false, message: "name, description, category and variants are required" };
  }

  if (!data.slug) {
    return { ok: false, message: "Unable to generate product slug" };
  }

  const category = await Category.findOne({
    _id: data.category,
    isActive: true,
    isDeleted: { $ne: true },
  }).lean();

  if (!category) {
    return { ok: false, message: "Invalid category" };
  }

  const taxValidation = await validateTaxCode(data.taxCode, category._id);
  if (!taxValidation.ok) {
    return taxValidation;
  }

  const variantValidation = validateCategoryRequiredVariantAttributes(category, data.variants);
  if (!variantValidation.ok) {
    return variantValidation;
  }

  const variantImageValidation = validateVariantImageLimits(data.variants);
  if (!variantImageValidation.ok) {
    return variantImageValidation;
  }

  const duplicateSlug = await Product.findOne({
    slug: data.slug,
    _id: { $ne: existingProduct?._id },
  }).select("_id");
  if (duplicateSlug) {
    return { ok: false, message: "Product slug already exists" };
  }

  return {
    ok: true,
    data: {
      ...data,
      seller: sellerId,
      categories: normalizeCategories(data.category, data.categories),
    },
  };
};

export const getMyProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      seller: req.user._id,
      isDeleted: { $ne: true },
    })
      .populate("category", "name slug")
      .populate("categories", "name slug");

    if (!product) {
      return res.status(200).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const productObj = product.toObject();
    productObj.variantSelectors = computeVariantSelectors(product);

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: productObj,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;
    const query = {
      seller: req.user._id,
      isDeleted: { $ne: true },
    };

    if (req.query.status) query.status = req.query.status;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Seller products fetched successfully",
      data: {
        items: products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const createMyProduct = async (req, res) => {
  try {
    // #region agent log
    agentLog({
      hypothesisId: "H4",
      location: "sellerProductController.js:createMyProduct",
      message: "createMyProduct entry",
      data: {
        variantCount: Array.isArray(req.body?.variants) ? req.body.variants.length : -1,
        firstImgCount:
          Array.isArray(req.body?.variants) && req.body.variants[0]
            ? (req.body.variants[0].images || []).length
            : -1,
      },
    });
    // #endregion
    const validation = await validateProductPayload({
      payload: req.body,
      sellerId: req.user._id,
    });

    if (!validation.ok) {
      // #region agent log
      agentLog({
        hypothesisId: "H4",
        location: "sellerProductController.js:createMyProduct",
        message: "validation failed",
        data: { msg: String(validation.message || "").slice(0, 120) },
      });
      // #endregion
      return res.status(200).json({
        success: false,
        message: validation.message,
        data: null,
      });
    }

    const data = { ...validation.data };
    if (!isAdminUser(req.user)) {
      const wantsPublish = data.status === "active" || data.status === "pending_approval";
      if (wantsPublish) {
        data.status = "pending_approval";
        data.moderationSubmittedAt = new Date();
        data.moderationNote = "";
        data.moderationReviewedAt = null;
        data.moderationReviewedBy = null;
      } else {
        data.status = "draft";
      }
    }

    const product = await Product.create(data);
    // #region agent log
    agentLog({
      hypothesisId: "H4",
      location: "sellerProductController.js:createMyProduct",
      message: "Product.create ok",
      data: { productId: String(product?._id || "") },
    });
    // #endregion
    return res.status(200).json({
      success: true,
      message: "Product listed successfully",
      data: product,
    });
  } catch (error) {
    // #region agent log
    agentLog({
      hypothesisId: "H4",
      location: "sellerProductController.js:createMyProduct.catch",
      message: "createMyProduct error",
      data: {
        errName: error?.name,
        errMsg: String(error?.message || error).slice(0, 200),
        code: error?.code,
      },
    });
    // #endregion
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const updateMyProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      seller: req.user._id,
      isDeleted: { $ne: true },
    });

    if (!product) {
      return res.status(200).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const validation = await validateProductPayload({
      payload: req.body,
      existingProduct: product,
      sellerId: req.user._id,
    });

    if (!validation.ok) {
      return res.status(200).json({
        success: false,
        message: validation.message,
        data: null,
      });
    }

    const data = { ...validation.data };
    if (!isAdminUser(req.user)) {
      const prev = product.status;
      const incoming = data.status;
      if (incoming === "draft") {
        data.status = "draft";
      } else if (prev === "active" && incoming !== "draft") {
        // Non-admin edits to an already-live listing stay published unless they move to draft.
        data.status = "active";
      } else if (incoming === "active" || incoming === "pending_approval") {
        data.status = "pending_approval";
        data.moderationSubmittedAt = new Date();
        data.moderationNote = "";
        data.moderationReviewedAt = null;
        data.moderationReviewedBy = null;
      }
    }

    Object.assign(product, data);
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
