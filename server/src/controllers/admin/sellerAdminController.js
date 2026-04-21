import SellerProfile from "../../models/SellerProfile.js";
import User from "../../models/User.js";
import Product from "../../models/Product.js";

const buildSellerListQuery = (req) => {
  const query = { isDeleted: { $ne: true } };
  if (req.query.status) query.onboardingStatus = req.query.status;
  if (req.query.isActive != null) query.isActive = req.query.isActive === "true";
  if (req.query.isVerified != null) query.isVerified = req.query.isVerified === "true";
  if (req.query.search) {
    const value = req.query.search.trim();
    query.$or = [
      { shopName: { $regex: value, $options: "i" } },
      { slug: { $regex: value, $options: "i" } },
      { gstin: { $regex: value, $options: "i" } },
    ];
  }
  return query;
};

const pushApprovalEvent = (profile, action, adminId, note = "") => {
  profile.approvalHistory.push({
    action,
    by: adminId,
    note: note || "",
    at: new Date(),
  });
};

export const getPendingSellerOnboarding = async (req, res) => {
  try {
    const pending = await SellerProfile.find({
      onboardingStatus: "pending_approval",
      isDeleted: { $ne: true },
    })
      .populate("userId", "name email phone role")
      .sort({ submittedAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Pending seller onboarding fetched successfully",
      data: pending,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getSellerProductsByProfile = async (req, res) => {
  try {
    const { sellerProfileId } = req.params;
    const profile = await SellerProfile.findOne({
      _id: sellerProfileId,
      isDeleted: { $ne: true },
    })
      .select("userId")
      .lean();

    if (!profile?.userId) {
      return res.status(200).json({
        success: false,
        message: "Seller profile not found",
        data: null,
      });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 50), 100);
    const skip = (page - 1) * limit;
    const query = { seller: profile.userId, isDeleted: { $ne: true } };
    if (req.query.status && typeof req.query.status === "string") {
      query.status = req.query.status;
    }

    const [items, total] = await Promise.all([
      Product.find(query)
        .populate("category", "name slug")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Seller products fetched successfully",
      data: {
        items,
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

export const getSellers = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(Math.max(1, Number(req.query.limit) || 20), 100);
    const skip = (page - 1) * limit;
    const query = buildSellerListQuery(req);

    const [items, total] = await Promise.all([
      SellerProfile.find(query)
        .populate("userId", "name email phone role isBlocked")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SellerProfile.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: "Sellers fetched successfully",
      data: {
        items,
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

export const approveSeller = async (req, res) => {
  try {
    const profile = await SellerProfile.findOne({
      _id: req.params.sellerProfileId,
      isDeleted: { $ne: true },
    });

    if (!profile) {
      return res.status(200).json({
        success: false,
        message: "Seller profile not found",
        data: null,
      });
    }

    profile.onboardingStatus = "approved";
    profile.isVerified = true;
    profile.isActive = req.body.activate === false ? false : true;
    profile.reviewedAt = new Date();
    profile.reviewedBy = req.user._id;
    profile.reviewNote = req.body.note || "Approved by admin";
    pushApprovalEvent(profile, "approved", req.user._id, profile.reviewNote);
    if (profile.isActive) {
      pushApprovalEvent(profile, "activated", req.user._id, "Activated during approval");
    }
    await profile.save();

    await User.findByIdAndUpdate(profile.userId, { role: "seller" });

    return res.status(200).json({
      success: true,
      message: "Seller approved successfully",
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const rejectSeller = async (req, res) => {
  try {
    const profile = await SellerProfile.findOne({
      _id: req.params.sellerProfileId,
      isDeleted: { $ne: true },
    });

    if (!profile) {
      return res.status(200).json({
        success: false,
        message: "Seller profile not found",
        data: null,
      });
    }

    const note = req.body.note || "Rejected by admin";
    profile.onboardingStatus = "rejected";
    profile.isVerified = false;
    profile.isActive = false;
    profile.reviewedAt = new Date();
    profile.reviewedBy = req.user._id;
    profile.reviewNote = note;
    pushApprovalEvent(profile, "rejected", req.user._id, note);
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Seller rejected successfully",
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const activateSeller = async (req, res) => {
  try {
    const profile = await SellerProfile.findOne({
      _id: req.params.sellerProfileId,
      isDeleted: { $ne: true },
    });

    if (!profile) {
      return res.status(200).json({
        success: false,
        message: "Seller profile not found",
        data: null,
      });
    }

    const active = req.body.active !== false;
    if (active && profile.onboardingStatus !== "approved") {
      return res.status(200).json({
        success: false,
        message: "Only approved sellers can be activated",
        data: null,
      });
    }

    profile.isActive = active;
    profile.reviewedAt = new Date();
    profile.reviewedBy = req.user._id;
    profile.reviewNote = req.body.note || (active ? "Activated by admin" : "Deactivated by admin");
    pushApprovalEvent(profile, active ? "activated" : "deactivated", req.user._id, profile.reviewNote);
    await profile.save();

    return res.status(200).json({
      success: true,
      message: active ? "Seller activated successfully" : "Seller deactivated successfully",
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
