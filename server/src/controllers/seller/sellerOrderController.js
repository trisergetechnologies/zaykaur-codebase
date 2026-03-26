import mongoose from "mongoose";
import Order from "../../models/Order.js";

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
