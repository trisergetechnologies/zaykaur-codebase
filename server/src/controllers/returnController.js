import ReturnRequest from "../models/ReturnRequest.js";
import Order from "../models/Order.js";
import {
  notifyReturnRefundCompleted,
  notifyReturnRequested,
} from "../lib/orderNotifications.js";

const RETURN_STATUSES = [
  "requested",
  "approved",
  "rejected",
  "pickup_scheduled",
  "picked_up",
  "received",
  "refund_initiated",
  "refund_completed",
  "closed",
];

function returnsQuery() {
  return ReturnRequest.find()
    .populate("userId", "name email phone")
    .populate("sellerId", "name email phone")
    .populate("orderId", "orderNumber createdAt deliveredAt grandTotal orderStatus")
    .lean();
}

// ---- Customer endpoints ----

export const createReturnRequest = async (req, res) => {
  try {
    const { orderId, items, reason, description, images } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ _id: orderId, userId, orderStatus: "delivered" });
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found or not eligible for return",
        data: null,
      });
    }

    const daysSinceDelivery = order.deliveredAt
      ? (Date.now() - new Date(order.deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    if (daysSinceDelivery > 15) {
      return res.status(400).json({
        success: false,
        message: "Return window has expired (15 days)",
        data: null,
      });
    }

    const existing = await ReturnRequest.findOne({
      orderId,
      userId,
      status: { $nin: ["rejected", "closed"] },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A return request already exists for this order",
        data: null,
      });
    }

    const returnItems = items.map((item) => {
      const orderItem = order.items.find(
        (oi) => oi.productId.toString() === item.productId
      );
      return {
        productId: item.productId,
        variantId: item.variantId || orderItem?.variantId,
        name: orderItem?.name || "",
        sku: orderItem?.sku || "",
        image: orderItem?.productSnapshot?.image || "",
        quantity: item.quantity,
        unitPrice: orderItem?.unitPrice || 0,
        lineTotal: (orderItem?.unitPrice || 0) * item.quantity,
      };
    });

    const refundAmount = returnItems.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );

    const sellerId = order.items[0]?.sellerId;

    const returnRequest = await ReturnRequest.create({
      orderId,
      userId,
      sellerId,
      items: returnItems,
      reason,
      description: description || "",
      images: images || [],
      refundAmount,
    });

    notifyReturnRequested(returnRequest, order).catch(() => null);

    return res.status(201).json({
      success: true,
      message: "Return request submitted",
      data: returnRequest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getMyReturnRequests = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;
    const query = { userId: req.user._id };

    // Optional order-level filter for order detail pages.
    if (req.query.orderId) {
      query.orderId = req.query.orderId;
    }

    // Optional status filter for tabs/analytics.
    if (req.query.status) {
      query.status = req.query.status;
    }

    const [returns, total] = await Promise.all([
      returnsQuery()
        .where(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReturnRequest.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Return requests fetched",
      data: {
        items: returns,
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

// ---- Seller endpoints ----

export const getSellerReturnRequests = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const query = { sellerId: req.user._id };
    if (req.query.status) query.status = req.query.status;

    const [returns, total] = await Promise.all([
      returnsQuery()
        .where(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReturnRequest.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Return requests fetched",
      data: {
        items: returns,
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

export const updateReturnStatus = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { status, sellerNote } = req.body;

    if (!RETURN_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return status",
        data: null,
      });
    }

    const validTransitions = {
      requested: ["approved", "rejected"],
      approved: ["pickup_scheduled"],
      pickup_scheduled: ["picked_up"],
      picked_up: ["received"],
      received: ["refund_initiated"],
      refund_initiated: ["refund_completed"],
      refund_completed: ["closed"],
    };

    const returnReq = await ReturnRequest.findById(returnId);
    if (!returnReq) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
        data: null,
      });
    }

    const allowed = validTransitions[returnReq.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${returnReq.status} to ${status}`,
        data: null,
      });
    }

    returnReq.status = status;
    if (sellerNote) returnReq.sellerNote = sellerNote;
    if (["refund_completed", "closed", "rejected"].includes(status)) {
      returnReq.resolvedAt = new Date();
      returnReq.resolvedBy = req.user._id;
    }

    await returnReq.save();

    if (status === "refund_completed") {
      const ord = await Order.findById(returnReq.orderId).select("orderNumber").lean();
      notifyReturnRefundCompleted(returnReq, ord).catch(() => null);
    }

    return res.status(200).json({
      success: true,
      message: `Return status updated to ${status}`,
      data: returnReq,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

// ---- Admin endpoints ----

export const getAllReturnRequests = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;

    const [returns, total] = await Promise.all([
      returnsQuery()
        .where(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReturnRequest.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Return requests fetched",
      data: {
        items: returns,
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

export const adminOverrideReturn = async (req, res) => {
  try {
    const { returnId } = req.params;
    const { status, adminNote, refundAmount } = req.body;

    if (!RETURN_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid return status",
        data: null,
      });
    }

    const returnReq = await ReturnRequest.findById(returnId);
    if (!returnReq) {
      return res.status(404).json({
        success: false,
        message: "Return request not found",
        data: null,
      });
    }

    returnReq.status = status;
    if (adminNote) returnReq.adminNote = adminNote;
    if (refundAmount != null) returnReq.refundAmount = refundAmount;
    returnReq.resolvedAt = new Date();
    returnReq.resolvedBy = req.user._id;

    await returnReq.save();

    if (status === "refund_completed") {
      const ord = await Order.findById(returnReq.orderId).select("orderNumber").lean();
      notifyReturnRefundCompleted(returnReq, ord).catch(() => null);
    }

    return res.status(200).json({
      success: true,
      message: `Return overridden to ${status}`,
      data: returnReq,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
