import Product from "../../models/Product.js";
import Category from "../../models/Category.js";
import mongoose from "mongoose";
import { computeVariantSelectors } from "../../lib/variantHelpers.js";

export const getAllProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 12, 100);
    const skip = (page - 1) * limit;

    const query = {
      status: "active",
      isDeleted: { $ne: true }
    };

    if (req.query.search && typeof req.query.search === "string" && req.query.search.trim()) {
      const term = req.query.search.trim();
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: term, $options: "i" } },
          { description: { $regex: term, $options: "i" } }
        ]
      });
    }

    if (req.query.category) {
      const cat = req.query.category;
      if (cat) {
        let categoryId = null;
        if (mongoose.Types.ObjectId.isValid(cat) && String(cat).length === 24) {
          categoryId = new mongoose.Types.ObjectId(cat);
        } else {
          const catDoc = await Category.findOne({ slug: cat, isActive: true, isDeleted: { $ne: true } })
            .select("_id")
            .lean();
          if (catDoc) categoryId = catDoc._id;
        }
        if (categoryId) {
          if (query.$and) {
            query.$and.push({
              $or: [
                { category: categoryId },
                { categories: categoryId }
              ]
            });
          } else {
            query.$or = [
              { category: categoryId },
              { categories: categoryId }
            ];
          }
        }
      }
    }

    if (req.query.seller) {
      query.seller = req.query.seller;
    }

    if (req.query.minPrice != null || req.query.maxPrice != null) {
      query["variants.price"] = {};
      if (req.query.minPrice != null) query["variants.price"].$gte = Number(req.query.minPrice);
      if (req.query.maxPrice != null) query["variants.price"].$lte = Number(req.query.maxPrice);
    }

    let sort = { createdAt: -1 };
    if (req.query.sort === "price_asc") sort = { "variants.0.price": 1 };
    if (req.query.sort === "price_desc") sort = { "variants.0.price": -1 };
    if (req.query.sort === "latest") sort = { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .populate("categories", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: {
        items: products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error("[getAllProducts] error:", error?.message || error);
    console.error("[getAllProducts] stack:", error?.stack);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "development" ? error.message : "Failed to fetch products",
      data: null
    });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      status: "active",
      isDeleted: { $ne: true }
    })
      .populate("category", "name slug")
      .populate("categories", "name slug");

    if (!product) {
      return res.status(200).json({
        success: false,
        message: "Product not found",
        data: null
      });
    }

    const productObj = product.toObject();
    productObj.variantSelectors = computeVariantSelectors(product);

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: productObj
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({
      slug,
      status: "active",
      isDeleted: { $ne: true }
    })
      .populate("category", "name slug")
      .populate("categories", "name slug");

    if (!product) {
      return res.status(200).json({
        success: false,
        message: "Product not found",
        data: null
      });
    }

    const productObj = product.toObject();
    productObj.variantSelectors = computeVariantSelectors(product);

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: productObj
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
