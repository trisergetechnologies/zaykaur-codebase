import Order from "../../models/Order.js";
import {
  applyOrderStatusTimestamps,
  canTransitionOrderStatus,
  canTransitionPaymentStatus,
} from "../../lib/orderLifecycle.js";

const parseDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

export const getAdminOrders = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;
    const { status, paymentStatus, from, to, search } = req.query;

    const query = {};
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
    if (search && String(search).trim()) {
      const term = String(search).trim();
      query.$or = [{ orderNumber: { $regex: term, $options: "i" } }];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "name email phone")
        .populate("items.sellerId", "name email")
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

export const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("userId", "name email phone")
      .populate("items.sellerId", "name email")
      .lean();
    if (!order) {
      return res.status(200).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
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

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(200).json({
        success: false,
        message: "status is required",
        data: null,
      });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(200).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    if (!canTransitionOrderStatus(order.orderStatus, status)) {
      return res.status(200).json({
        success: false,
        message: `Invalid transition from '${order.orderStatus}' to '${status}'`,
        data: null,
      });
    }

    order.orderStatus = status;
    applyOrderStatusTimestamps(order, status, new Date());
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

export const updateOrderPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    if (!paymentStatus) {
      return res.status(200).json({
        success: false,
        message: "paymentStatus is required",
        data: null,
      });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(200).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }

    if (!canTransitionPaymentStatus(order.paymentStatus, paymentStatus)) {
      return res.status(200).json({
        success: false,
        message: `Invalid payment status transition from '${order.paymentStatus}' to '${paymentStatus}'`,
        data: null,
      });
    }

    order.paymentStatus = paymentStatus;
    if (paymentId) order.paymentId = paymentId;
    if (paymentStatus === "paid" && !order.paidAt) order.paidAt = new Date();
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
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
