import mongoose from "mongoose";
import Product from "../../models/Product.js";
import Category from "../../models/Category.js";
import User from "../../models/User.js";
import { computeVariantSelectors } from "../../lib/variantHelpers.js";

function resolveProductId(req) {
  return (
    (typeof req.params?.productId === "string" && req.params.productId.trim()) ||
    (typeof req.body?.productId === "string" && req.body.productId.trim()) ||
    ""
  );
}

export const getPendingProducts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;

    const query = { status: "pending_approval", isDeleted: { $ne: true } };

    const [rawItems, total] = await Promise.all([
      Product.find(query)
        .sort({ moderationSubmittedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const sellerIds = [
      ...new Set(
        rawItems.map((p) => p.seller).filter(Boolean).map((id) => String(id))
      ),
    ];
    const categoryIds = [
      ...new Set(
        rawItems.map((p) => p.category).filter(Boolean).map((id) => String(id))
      ),
    ];

    const [users, categories] = await Promise.all([
      sellerIds.length
        ? User.find({ _id: { $in: sellerIds } })
            .select("name email phone")
            .lean()
        : [],
      categoryIds.length
        ? Category.find({ _id: { $in: categoryIds } })
            .select("name slug")
            .lean()
        : [],
    ]);

    const userById = Object.fromEntries(users.map((u) => [String(u._id), u]));
    const catById = Object.fromEntries(categories.map((c) => [String(c._id), c]));

    const items = rawItems.map((p) => ({
      ...p,
      seller: userById[String(p.seller)] ?? p.seller,
      category: catById[String(p.category)] ?? p.category,
    }));

    return res.status(200).json({
      success: true,
      message: "Pending products fetched successfully",
      data: {
        items,
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

export const getPendingProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.productId,
      status: "pending_approval",
      isDeleted: { $ne: true },
    })
      .populate("category", "name slug")
      .populate("seller", "name email phone");

    if (!product) {
      return res.status(200).json({
        success: false,
        message: "Pending product not found",
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

export const approveProduct = async (req, res) => {
  try {
    const rawId = resolveProductId(req);
    if (!mongoose.Types.ObjectId.isValid(rawId)) {
      return res.status(200).json({
        success: false,
        message: "Invalid product id",
        data: null,
      });
    }

    // Atomic update avoids full-document save() validation issues on embedded variants.
    const product = await Product.findOneAndUpdate(
      {
        _id: rawId,
        status: "pending_approval",
        isDeleted: { $ne: true },
      },
      {
        $set: {
          status: "active",
          moderationNote: "",
          moderationReviewedAt: new Date(),
          moderationReviewedBy: req.user._id,
        },
      },
      { new: true, runValidators: false }
    )
      .populate("category", "name slug")
      .populate("seller", "name email");

    if (!product) {
      const exists = await Product.findOne({ _id: rawId }).select("status").lean();
      if (!exists) {
        return res.status(200).json({
          success: false,
          message: "Product not found",
          data: null,
        });
      }
      return res.status(200).json({
        success: false,
        message: `Only products pending approval can be approved (current status: ${exists.status})`,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product approved and published",
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

export const rejectProduct = async (req, res) => {
  try {
    const rawId = resolveProductId(req);
    if (!mongoose.Types.ObjectId.isValid(rawId)) {
      return res.status(200).json({
        success: false,
        message: "Invalid product id",
        data: null,
      });
    }

    const note = typeof req.body?.note === "string" ? req.body.note.trim() : "";
    if (!note) {
      return res.status(200).json({
        success: false,
        message: "Rejection reason (note) is required",
        data: null,
      });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: rawId,
        status: "pending_approval",
        isDeleted: { $ne: true },
      },
      {
        $set: {
          status: "rejected",
          moderationNote: note,
          moderationReviewedAt: new Date(),
          moderationReviewedBy: req.user._id,
        },
      },
      { new: true, runValidators: false }
    )
      .populate("category", "name slug")
      .populate("seller", "name email");

    if (!product) {
      const exists = await Product.findOne({ _id: rawId }).select("status").lean();
      if (!exists) {
        return res.status(200).json({
          success: false,
          message: "Product not found",
          data: null,
        });
      }
      return res.status(200).json({
        success: false,
        message: `Only products pending approval can be rejected (current status: ${exists.status})`,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product rejected",
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

/**
 * Remove a live listing from the storefront (admin). Allowed from active or out_of_stock.
 */
export const deactivateProductListing = async (req, res) => {
  try {
    const rawId = resolveProductId(req);
    if (!mongoose.Types.ObjectId.isValid(rawId)) {
      return res.status(200).json({
        success: false,
        message: "Invalid product id",
        data: null,
      });
    }

    let oid;
    try {
      oid = new mongoose.Types.ObjectId(rawId);
    } catch {
      return res.status(200).json({
        success: false,
        message: "Invalid product id",
        data: null,
      });
    }

    // No populate on findOneAndUpdate — populate can throw if refs are broken (Mongoose 9).
    const product = await Product.findOneAndUpdate(
      {
        _id: oid,
        isDeleted: { $ne: true },
        status: { $in: ["active", "out_of_stock"] },
      },
      {
        $set: {
          status: "discontinued",
          moderationReviewedAt: new Date(),
          moderationReviewedBy: req.user._id,
        },
      },
      { new: true, runValidators: false }
    )
      .select("_id name slug status updatedAt")
      .lean();

    if (!product) {
      const exists = await Product.findOne({ _id: oid }).select("status").lean();
      if (!exists) {
        return res.status(200).json({
          success: false,
          message: "Product not found",
          data: null,
        });
      }
      return res.status(200).json({
        success: false,
        message: `Only active or out-of-stock listings can be deactivated (current status: ${exists.status})`,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deactivated (removed from storefront)",
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

/**
 * Restore a discontinued listing to active (admin).
 */
export const reactivateProductListing = async (req, res) => {
  try {
    const rawId = resolveProductId(req);
    if (!mongoose.Types.ObjectId.isValid(rawId)) {
      return res.status(200).json({
        success: false,
        message: "Invalid product id",
        data: null,
      });
    }

    let oid;
    try {
      oid = new mongoose.Types.ObjectId(rawId);
    } catch {
      return res.status(200).json({
        success: false,
        message: "Invalid product id",
        data: null,
      });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: oid,
        isDeleted: { $ne: true },
        status: "discontinued",
      },
      {
        $set: {
          status: "active",
          moderationReviewedAt: new Date(),
          moderationReviewedBy: req.user._id,
        },
      },
      { new: true, runValidators: false }
    )
      .select("_id name slug status updatedAt")
      .lean();

    if (!product) {
      const exists = await Product.findOne({ _id: oid }).select("status").lean();
      if (!exists) {
        return res.status(200).json({
          success: false,
          message: "Product not found",
          data: null,
        });
      }
      return res.status(200).json({
        success: false,
        message: `Only discontinued products can be reactivated this way (current status: ${exists.status})`,
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product reactivated on the storefront",
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
