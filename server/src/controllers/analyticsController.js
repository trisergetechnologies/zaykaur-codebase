import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const days = Number(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const sellerObjId = new mongoose.Types.ObjectId(sellerId);

    const [salesOverTime, topProducts, summary] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: since }, "items.sellerId": sellerObjId } },
        { $unwind: "$items" },
        { $match: { "items.sellerId": sellerObjId } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$items.lineTotal" },
            orders: { $addToSet: "$_id" },
            unitsSold: { $sum: "$items.quantity" },
          },
        },
        { $addFields: { orderCount: { $size: "$orders" } } },
        { $project: { orders: 0 } },
        { $sort: { _id: 1 } },
      ]),

      Order.aggregate([
        { $match: { createdAt: { $gte: since }, "items.sellerId": sellerObjId } },
        { $unwind: "$items" },
        { $match: { "items.sellerId": sellerObjId } },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.productSnapshot.name" },
            totalRevenue: { $sum: "$items.lineTotal" },
            totalQuantity: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]),

      Order.aggregate([
        { $match: { createdAt: { $gte: since }, "items.sellerId": sellerObjId } },
        { $unwind: "$items" },
        { $match: { "items.sellerId": sellerObjId } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$items.lineTotal" },
            totalOrders: { $addToSet: "$_id" },
            totalUnits: { $sum: "$items.quantity" },
          },
        },
        { $addFields: { totalOrders: { $size: "$totalOrders" } } },
      ]),
    ]);

    const summaryData = summary[0] || { totalRevenue: 0, totalOrders: 0, totalUnits: 0 };

    return res.status(200).json({
      success: true,
      message: "Seller analytics fetched",
      data: {
        period: { days, since },
        summary: {
          totalRevenue: summaryData.totalRevenue,
          totalOrders: summaryData.totalOrders,
          totalUnits: summaryData.totalUnits,
          avgOrderValue: summaryData.totalOrders > 0
            ? Math.round(summaryData.totalRevenue / summaryData.totalOrders)
            : 0,
        },
        salesOverTime,
        topProducts,
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

export const getAdminAnalytics = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [gmvOverTime, topSellers, userGrowth, platformSummary] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            gmv: { $sum: "$grandTotal" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.sellerId",
            revenue: { $sum: "$items.lineTotal" },
            orderCount: { $addToSet: "$_id" },
          },
        },
        { $addFields: { orderCount: { $size: "$orderCount" } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "seller",
          },
        },
        { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            sellerId: "$_id",
            name: "$seller.name",
            revenue: 1,
            orderCount: 1,
          },
        },
      ]),

      User.aggregate([
        { $match: { createdAt: { $gte: since }, role: "customer", isDeleted: false } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            newUsers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: since } } },
          {
            $group: {
              _id: null,
              totalGMV: { $sum: "$grandTotal" },
              totalOrders: { $sum: 1 },
              avgOrderValue: { $avg: "$grandTotal" },
            },
          },
        ]),
        User.countDocuments({ role: "customer", isDeleted: false }),
        User.countDocuments({ role: "seller", isDeleted: false }),
        Product.countDocuments({ status: "active", isDeleted: false }),
      ]),
    ]);

    const [orderStats, totalCustomers, totalSellers, totalProducts] = platformSummary;
    const stats = orderStats[0] || { totalGMV: 0, totalOrders: 0, avgOrderValue: 0 };

    return res.status(200).json({
      success: true,
      message: "Admin analytics fetched",
      data: {
        period: { days, since },
        summary: {
          totalGMV: stats.totalGMV,
          totalOrders: stats.totalOrders,
          avgOrderValue: Math.round(stats.avgOrderValue || 0),
          totalCustomers,
          totalSellers,
          totalProducts,
        },
        gmvOverTime,
        topSellers,
        userGrowth,
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
