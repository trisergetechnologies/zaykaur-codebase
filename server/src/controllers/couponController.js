import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";

export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validTo: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired coupon code",
        data: null,
      });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
        data: null,
      });
    }

    const userUsage = coupon.usedBy.find(
      (u) => u.userId.toString() === userId.toString()
    );
    if (userUsage && userUsage.count >= coupon.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: "You have already used this coupon the maximum number of times",
        data: null,
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
        data: null,
      });
    }

    const cartTotal = cart.itemsTotal || 0;

    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
        data: null,
      });
    }

    let discount = 0;
    if (coupon.type === "percent") {
      discount = Math.round(cartTotal * (coupon.value / 100));
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = Math.min(coupon.value, cartTotal);
    }

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        cartTotal,
        newTotal: cartTotal - discount,
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

export const removeCoupon = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Coupon removed",
    data: null,
  });
};

// ---- Admin endpoints ----

export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase(),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.active === "true") query.isActive = true;
    if (req.query.active === "false") query.isActive = false;

    const [coupons, total] = await Promise.all([
      Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Coupon.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Coupons fetched successfully",
      data: {
        items: coupons,
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

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.couponId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.couponId,
      { isActive: false },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon deactivated successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
