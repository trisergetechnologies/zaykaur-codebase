import mongoose from "mongoose";
import Product from "../../models/Product.js";
import { computeVariantSelectors } from "../../lib/variantHelpers.js";

export const getPendingProducts = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;

    const query = { status: "pending_approval", isDeleted: { $ne: true } };

    const [items, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .populate("seller", "name email phone")
        .sort({ moderationSubmittedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

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
    const rawId = req.params.productId;
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
    const rawId = req.params.productId;
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
