import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  try {
    const level = req.query.level != null ? Number(req.query.level) : null;
    const parent = req.query.parent;

    const query = { isActive: true, isDeleted: { $ne: true } };
    if (level !== null && !isNaN(level)) query.level = level;
    if (parent) {
      if (parent === "root" || parent === "null") {
        query.parent = null;
      } else {
        query.parent = parent;
      }
    }

    const categories = await Category.find(query)
      .sort({ displayOrder: 1, name: 1 })
      .select("name slug level parent image displayOrder variantAttributeTemplates")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("[getCategories] error:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === "development" ? error.message : "Failed to fetch categories",
      data: null,
    });
  }
};
