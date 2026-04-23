import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { discountFromCoupon } from "../lib/couponMath.js";

/** Merchandise sum from line items (matches cart / order subtotal logic). */
function merchandiseFromCartItems(cart) {
  if (!cart?.items?.length) return 0;
  return cart.items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);
}

export function recalcCartTotals(cart) {
  const merch = merchandiseFromCartItems(cart);
  cart.itemsTotal = merch;
  let disc = Math.min(merch, Math.max(0, Number(cart.couponDiscount) || 0));
  if (!cart.appliedCouponCode) disc = 0;
  cart.couponDiscount = disc;
  const net = Math.max(0, merch - disc);
  cart.taxTotal = Math.round(net * 0.05);
  cart.shippingEstimate = merch >= 999 ? 0 : 80;
  cart.grandTotal = net + cart.taxTotal + cart.shippingEstimate;
}

/**
 * Re-validates applied coupon against current lines and user; clears if invalid.
 * Mutates cart; does not save.
 */
export async function syncAppliedCouponOnCart(cart, userId) {
  if (!cart) return;
  cart.itemsTotal = merchandiseFromCartItems(cart);
  if (!cart.items?.length) {
    cart.appliedCouponCode = null;
    cart.couponDiscount = 0;
    recalcCartTotals(cart);
    return;
  }
  if (!cart.appliedCouponCode) {
    cart.couponDiscount = 0;
    recalcCartTotals(cart);
    return;
  }

  const coupon = await Coupon.findOne({
    code: String(cart.appliedCouponCode).toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validTo: { $gte: new Date() },
  });

  const clear = () => {
    cart.appliedCouponCode = null;
    cart.couponDiscount = 0;
  };

  if (!coupon) {
    clear();
    recalcCartTotals(cart);
    return;
  }

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    clear();
    recalcCartTotals(cart);
    return;
  }

  const userUsage = coupon.usedBy.find((u) => u.userId.toString() === userId.toString());
  if (userUsage && userUsage.count >= coupon.perUserLimit) {
    clear();
    recalcCartTotals(cart);
    return;
  }

  const cartTotal = cart.itemsTotal || 0;
  if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
    clear();
    recalcCartTotals(cart);
    return;
  }

  cart.couponDiscount = discountFromCoupon(coupon, cartTotal);
  cart.appliedCouponCode = coupon.code;
  recalcCartTotals(cart);
}

/** Used at checkout / order placement: discount only if cart has a code and coupon still valid. */
export async function validateAppliedCartCouponForOrder(cart, userId, merchandiseSubtotal) {
  if (!cart?.appliedCouponCode || merchandiseSubtotal <= 0) {
    return { discount: 0, coupon: null };
  }
  const coupon = await Coupon.findOne({
    code: String(cart.appliedCouponCode).toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validTo: { $gte: new Date() },
  });
  if (!coupon) return { discount: 0, coupon: null };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { discount: 0, coupon: null };
  }
  const userUsage = coupon.usedBy.find((u) => u.userId.toString() === userId.toString());
  if (userUsage && userUsage.count >= coupon.perUserLimit) {
    return { discount: 0, coupon: null };
  }
  if (coupon.minOrderAmount && merchandiseSubtotal < coupon.minOrderAmount) {
    return { discount: 0, coupon: null };
  }
  if (!(await isUserEligibleForCheckoutCoupon(userId, coupon.audience || "all"))) {
    return { discount: 0, coupon: null };
  }
  return { discount: discountFromCoupon(coupon, merchandiseSubtotal), coupon };
}

async function isUserEligibleForCheckoutCoupon(userId, audience) {
  if (audience !== "new_users") return true;
  const user = await User.findById(userId).select("createdAt").lean();
  const orderCount = await Order.countDocuments({ userId });
  if (orderCount === 0) return true;
  if (user?.createdAt) {
    const ageMs = Date.now() - new Date(user.createdAt).getTime();
    if (ageMs < 30 * 24 * 60 * 60 * 1000) return true;
  }
  return false;
}

export const getCheckoutCoupons = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const raw = await Coupon.find({
      isActive: true,
      showOnCheckout: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
    })
      .select("code description type value minOrderAmount maxDiscount audience usageLimit usedCount")
      .lean();

    const coupons = raw.filter(
      (c) => c.usageLimit == null || (c.usedCount || 0) < c.usageLimit
    );

    const eligible = [];
    for (const c of coupons) {
      if (!(await isUserEligibleForCheckoutCoupon(userId, c.audience || "all"))) continue;
      eligible.push({
        code: c.code,
        description: c.description || "",
        type: c.type,
        value: c.value,
        minOrderAmount: c.minOrderAmount || 0,
        audience: c.audience || "all",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Checkout coupons",
      data: eligible,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
        data: null,
      });
    }
    const userId = req.user._id;

    const coupon = await Coupon.findOne({
      code: String(code).toUpperCase().trim(),
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

    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
        data: null,
      });
    }

    const userUsage = coupon.usedBy.find((u) => u.userId.toString() === userId.toString());
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

    const cartTotal = merchandiseFromCartItems(cart);
    cart.itemsTotal = cartTotal;

    if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
        data: null,
      });
    }

    if (!(await isUserEligibleForCheckoutCoupon(userId, coupon.audience || "all"))) {
      return res.status(400).json({
        success: false,
        message: "This offer is only for new customers",
        data: null,
      });
    }

    cart.appliedCouponCode = coupon.code;
    cart.couponDiscount = discountFromCoupon(coupon, cartTotal);
    recalcCartTotals(cart);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: cart.couponDiscount,
        cartTotal,
        newMerchandiseTotal: Math.max(0, cartTotal - cart.couponDiscount),
        cart,
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
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Coupon removed",
        data: null,
      });
    }
    cart.appliedCouponCode = null;
    cart.couponDiscount = 0;
    recalcCartTotals(cart);
    await cart.save();
    return res.status(200).json({
      success: true,
      message: "Coupon removed",
      data: { cart },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export async function incrementCouponUsage(couponId, userId) {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return;
  coupon.usedCount = (coupon.usedCount || 0) + 1;
  const idx = coupon.usedBy.findIndex((u) => u.userId.toString() === userId.toString());
  if (idx >= 0) coupon.usedBy[idx].count = (coupon.usedBy[idx].count || 0) + 1;
  else coupon.usedBy.push({ userId, count: 1 });
  await coupon.save();
}

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
