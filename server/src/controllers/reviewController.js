import mongoose from "mongoose";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, body, images, orderId } = req.body;
    const userId = req.user._id;

    const existing = await Review.findOne({ productId, userId, isDeleted: false });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this product",
        data: null,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        userId,
        orderStatus: "delivered",
        "items.productId": productId,
      });
      isVerifiedPurchase = !!order;
    } else {
      const anyOrder = await Order.findOne({
        userId,
        orderStatus: "delivered",
        "items.productId": productId,
      });
      isVerifiedPurchase = !!anyOrder;
    }

    const review = await Review.create({
      userId,
      productId,
      orderId: orderId || null,
      rating,
      title: title || "",
      body: body || "",
      images: images || [],
      isVerifiedPurchase,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const sort = req.query.sort === "helpful"
      ? { helpfulCount: -1, createdAt: -1 }
      : { createdAt: -1 };

    const query = {
      productId,
      isApproved: true,
      isDeleted: false,
    };

    const [reviews, total, stats] = await Promise.all([
      Review.find(query)
        .populate("userId", "name avatar")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(query),
      Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId), isApproved: true, isDeleted: false } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            rating5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
            rating4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            rating3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            rating2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            rating1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const ratingStats = stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      rating5: 0,
      rating4: 0,
      rating3: 0,
      rating2: 0,
      rating1: 0,
    };

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: {
        items: reviews,
        stats: {
          averageRating: Math.round((ratingStats.averageRating || 0) * 10) / 10,
          totalReviews: ratingStats.totalReviews,
          distribution: {
            5: ratingStats.rating5,
            4: ratingStats.rating4,
            3: ratingStats.rating3,
            2: ratingStats.rating2,
            1: ratingStats.rating1,
          },
        },
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
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

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, body, images } = req.body;

    const review = await Review.findOne({ _id: reviewId, userId: req.user._id, isDeleted: false });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
        data: null,
      });
    }

    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (body !== undefined) review.body = body;
    if (images !== undefined) review.images = images;

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId, userId: req.user._id, isDeleted: false });
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
        data: null,
      });
    }

    review.isDeleted = true;
    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
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
