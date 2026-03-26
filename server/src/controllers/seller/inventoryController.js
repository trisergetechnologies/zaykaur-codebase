import Product from "../../models/Product.js";

const LOW_STOCK_THRESHOLD = 5;

export const getInventory = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = { seller: sellerId, isDeleted: false };

    if (req.query.lowStock === "true") {
      query["variants.stock"] = { $lte: LOW_STOCK_THRESHOLD };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .select("name slug variants status")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    const inventory = products.map((p) => ({
      productId: p._id,
      name: p.name,
      slug: p.slug,
      status: p.status,
      variants: p.variants.map((v) => ({
        variantId: v._id,
        sku: v.sku,
        attributes: v.attributes,
        stock: v.stock,
        price: v.price,
        isLowStock: v.stock <= LOW_STOCK_THRESHOLD,
        isActive: v.isActive,
      })),
      totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    }));

    return res.status(200).json({
      success: true,
      message: "Inventory fetched successfully",
      data: {
        items: inventory,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
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

export const updateStock = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { stock } = req.body;

    if (stock == null || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative number",
        data: null,
      });
    }

    const product = await Product.findOne({
      _id: productId,
      seller: req.user._id,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
        data: null,
      });
    }

    variant.stock = stock;
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      data: { productId, variantId, stock: variant.stock },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Updates array is required",
        data: null,
      });
    }

    const results = [];
    const errors = [];

    for (const item of updates) {
      try {
        const result = await Product.updateOne(
          {
            _id: item.productId,
            seller: req.user._id,
            "variants._id": item.variantId,
            isDeleted: false,
          },
          { $set: { "variants.$.stock": item.stock } }
        );

        if (result.modifiedCount > 0) {
          results.push({ productId: item.productId, variantId: item.variantId, stock: item.stock, status: "updated" });
        } else {
          errors.push({ productId: item.productId, variantId: item.variantId, status: "not_found" });
        }
      } catch (e) {
        errors.push({ productId: item.productId, variantId: item.variantId, status: "error", message: e.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `${results.length} updated, ${errors.length} failed`,
      data: { updated: results, failed: errors },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getLowStockAlerts = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const products = await Product.find({
      seller: sellerId,
      isDeleted: false,
      "variants.stock": { $lte: LOW_STOCK_THRESHOLD },
    })
      .select("name slug variants")
      .lean();

    const alerts = [];
    for (const p of products) {
      for (const v of p.variants) {
        if (v.stock <= LOW_STOCK_THRESHOLD) {
          alerts.push({
            productId: p._id,
            productName: p.name,
            variantId: v._id,
            sku: v.sku,
            stock: v.stock,
            attributes: v.attributes,
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: `${alerts.length} low stock alert(s)`,
      data: alerts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
