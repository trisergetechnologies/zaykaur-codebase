import Cart from "../../models/Cart.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import TaxRule from "../../models/TaxRule.js";
import User from "../../models/User.js";
import {
  validateAppliedCartCouponForOrder,
  incrementCouponUsage,
} from "../couponController.js";
import {
  notifyLowStockAfterDecrement,
  notifyOrderPlaced,
} from "../../lib/orderNotifications.js";

export const createOrder = async (req, res) => {
  const reservedStocks = [];
  let orderCreated = false;
  const createdOrderIds = [];
  try {
    const fail = (message, statusCode = 200) => {
      const error = new Error(message);
      error.statusCode = statusCode;
      throw error;
    };

    const { addressIndex, paymentMethod } = req.body;
    const user = await User.findById(req.user._id);

    const address =
      addressIndex != null
        ? user?.addresses?.[Number(addressIndex)]
        : user?.addresses?.find((value) => value.isDefault) || user?.addresses?.[0];

    if (!address) {
      fail("No address found. Add an address or pass addressIndex.");
    }

    if (!paymentMethod) {
      fail("Payment method is required");
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
      fail("Cart is empty");
    }

    const orderItems = [];
    let subtotal = 0;
    let taxTotal = 0;
    const now = new Date();

    for (const item of cart.items) {
      const product = await Product.findById(item.productId).select("name slug seller variants taxCode");
      if (!product || !product.variants?.length) continue;

      if (!product.seller) {
        fail(`Product "${product.name}" has no seller assigned; cannot place order`);
      }

      const variant = item.variantId ? product.variants.id(item.variantId) : product.variants?.[0];
      if (!variant) {
        fail(`Variant not found for ${product.name}`);
      }

      if (variant.stock < item.quantity) {
        fail(`Insufficient stock for ${product.name}`);
      }

      const stockUpdate = await Product.updateOne(
        {
          _id: product._id,
          variants: {
            $elemMatch: {
              _id: variant._id,
              stock: { $gte: item.quantity },
            },
          },
        },
        {
          $inc: {
            "variants.$.stock": -item.quantity,
          },
        }
      );

      if (!stockUpdate.modifiedCount) {
        fail(`Insufficient stock for ${product.name}`);
      }

      notifyLowStockAfterDecrement(product._id, variant._id).catch(() => null);

      reservedStocks.push({
        productId: product._id,
        variantId: variant._id,
        quantity: item.quantity,
      });

      const taxRule = product.taxCode
        ? await TaxRule.findOne({
          code: product.taxCode,
          isActive: true,
          $and: [
            { $or: [{ effectiveFrom: null }, { effectiveFrom: { $lte: now } }] },
            { $or: [{ effectiveTo: null }, { effectiveTo: { $gte: now } }] },
          ],
        }).select("code type rate")
        : null;

      const rate = taxRule?.rate ?? 0;
      const unitPrice = variant.price;
      const qty = item.quantity;
      const lineTax = Math.round(unitPrice * qty * (rate / 100));
      const lineTotal = unitPrice * qty + lineTax;

      subtotal += unitPrice * qty;
      taxTotal += lineTax;

      orderItems.push({
        productId: product._id,
        variantId: variant._id,
        name: product.name,
        sku: variant.sku,
        quantity: qty,
        unitPrice,
        taxCode: taxRule?.code || product.taxCode || "",
        taxType: taxRule?.type || "unknown",
        taxRate: rate,
        taxAmount: lineTax,
        lineTotal,
        // Always use product owner — cart line sellerId can be stale or wrong
        sellerId: product.seller,
        productSnapshot: {
          name: product.name,
          slug: product.slug,
          image: variant.images?.[0]?.url,
        },
      });
    }

    if (!orderItems.length) {
      fail("No valid items found in cart");
    }

    const { discount: discountTotal, coupon: appliedCoupon } = await validateAppliedCartCouponForOrder(
      cart,
      req.user._id,
      subtotal
    );
    const couponCode = appliedCoupon && discountTotal > 0 ? appliedCoupon.code : null;

    // Enterprise pattern: split checkout by seller into separate orders.
    const groups = new Map();
    for (const line of orderItems) {
      const sellerKey = String(line.sellerId);
      const existing = groups.get(sellerKey);
      if (existing) {
        existing.items.push(line);
      } else {
        groups.set(sellerKey, {
          sellerId: line.sellerId,
          items: [line],
        });
      }
    }

    const grouped = Array.from(groups.values()).map((g) => {
      const groupSubtotal = g.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      const groupTax = g.items.reduce((sum, i) => sum + (i.taxAmount || 0), 0);
      return {
        ...g,
        subtotal: groupSubtotal,
        taxTotal: groupTax,
      };
    });

    const totalSubtotal = grouped.reduce((s, g) => s + g.subtotal, 0);
    const totalShipping = totalSubtotal >= 999 ? 0 : 80;
    const shippingByGroup = grouped.map((g, idx) => {
      if (totalShipping === 0) return 0;
      if (idx === grouped.length - 1) {
        const allocated = grouped
          .slice(0, idx)
          .reduce((s, _, i) => s + Math.round((grouped[i].subtotal / totalSubtotal) * totalShipping), 0);
        return Math.max(0, totalShipping - allocated);
      }
      return Math.round((g.subtotal / totalSubtotal) * totalShipping);
    });

    const discountByGroup = grouped.map((g, idx) => {
      if (!discountTotal) return 0;
      if (idx === grouped.length - 1) {
        const allocated = grouped
          .slice(0, idx)
          .reduce((s, _, i) => s + Math.round((grouped[i].subtotal / totalSubtotal) * discountTotal), 0);
        return Math.max(0, discountTotal - allocated);
      }
      return Math.round((g.subtotal / totalSubtotal) * discountTotal);
    });

    const baseOrderNumber = Date.now();
    const createdOrders = [];
    for (let idx = 0; idx < grouped.length; idx += 1) {
      const g = grouped[idx];
      const shippingAmount = shippingByGroup[idx] || 0;
      const groupDiscount = Math.min(g.subtotal, discountByGroup[idx] || 0);
      const grandTotal = g.subtotal + g.taxTotal + shippingAmount - groupDiscount;

      const order = await Order.create({
        userId: req.user._id,
        orderNumber: `ZK-${baseOrderNumber}-${idx + 1}`,
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        billingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        items: g.items,
        subtotal: g.subtotal,
        taxTotal: g.taxTotal,
        shippingAmount,
        discountTotal: groupDiscount,
        couponCode,
        grandTotal,
        currency: "INR",
        paymentMethod: paymentMethod === "online" ? "online" : "cod",
        paymentStatus: "pending",
        orderStatus: "placed",
      });
      createdOrders.push(order);
      createdOrderIds.push(order._id);
    }
    orderCreated = true;
    reservedStocks.length = 0;

    for (const o of createdOrders) {
      notifyOrderPlaced(o, user);
    }

    if (appliedCoupon && discountTotal > 0) {
      await incrementCouponUsage(appliedCoupon._id, req.user._id).catch(() => null);
    }

    // Order remains source of truth even if cart cleanup fails.
    await Cart.findOneAndDelete({ userId: req.user._id }).catch(() => null);

    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      data:
        createdOrders.length > 1
          ? {
              orders: createdOrders,
              orderIds: createdOrders.map((o) => o._id),
              orderNumbers: createdOrders.map((o) => o.orderNumber),
              splitBySeller: true,
            }
          : createdOrders[0],
    });
  } catch (error) {
    if (!orderCreated) {
      await Promise.all(
        reservedStocks.map((entry) =>
          Product.updateOne(
            {
              _id: entry.productId,
              "variants._id": entry.variantId,
            },
            {
              $inc: {
                "variants.$.stock": entry.quantity,
              },
            }
          )
        )
      ).catch(() => null);
    }
    if (createdOrderIds.length > 0) {
      await Order.deleteMany({ _id: { $in: createdOrderIds } }).catch(() => null);
    }

    const status = error?.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ userId: req.user._id })
    ]);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: {
        items: orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(200).json({
        success: false,
        message: "Order not found",
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null
    });
  }
};
