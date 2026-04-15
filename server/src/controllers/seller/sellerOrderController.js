import mongoose from "mongoose";
import Order from "../../models/Order.js";
import {
  applyOrderStatusTimestamps,
  canTransitionOrderStatus,
} from "../../lib/orderLifecycle.js";

const orderIncludesSeller = (order, sellerId) => {
  const sellerObjId = mongoose.Types.ObjectId.isValid(String(sellerId))
    ? new mongoose.Types.ObjectId(String(sellerId))
    : sellerId;
  const items = order?.items || [];
  return items.some((item) => {
    const sid = item.sellerId;
    if (sid == null) return false;
    if (typeof sid.equals === "function" && sid.equals(sellerObjId)) return true;
    return String(sid) === String(sellerId) || String(sid) === String(sellerObjId);
  });
};

const parseDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * List orders that contain at least one item from the logged-in seller.
 */
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const sellerObjId = mongoose.Types.ObjectId.isValid(String(sellerId))
      ? new mongoose.Types.ObjectId(String(sellerId))
      : sellerId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;
    const { status, paymentStatus, from, to } = req.query;

    // Match any line item sold by this seller (ObjectId or legacy string)
    const query = {
      $or: [
        { "items.sellerId": sellerObjId },
        { "items.sellerId": String(sellerId) },
      ],
    };
    if (status && String(status).trim()) query.orderStatus = String(status).trim();
    if (paymentStatus && String(paymentStatus).trim()) query.paymentStatus = String(paymentStatus).trim();
    if (from || to) {
      query.createdAt = {};
      const fromDate = parseDate(from);
      const toDate = parseDate(to);
      if (fromDate) query.createdAt.$gte = fromDate;
      if (toDate) {
        const end = new Date(toDate);
        end.setUTCHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
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

/**
 * PATCH order status for seller: same lifecycle rules as admin, but only if the
 * order contains at least one line item sold by this seller (admins/staff may update any order).
 */
export const updateSellerOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !String(status).trim()) {
      return res.status(200).json({
        success: false,
        message: "status is required",
        data: null,
      });
    }

    const nextStatus = String(status).trim();
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(200).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    const role = req.user?.role;
    if (role === "seller" && !orderIncludesSeller(order, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update orders that include your products",
        data: null,
      });
    }

    if (!canTransitionOrderStatus(order.orderStatus, nextStatus)) {
      return res.status(200).json({
        success: false,
        message: `Invalid transition from '${order.orderStatus}' to '${nextStatus}'`,
        data: null,
      });
    }

    order.orderStatus = nextStatus;
    applyOrderStatusTimestamps(order, nextStatus, new Date());
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
