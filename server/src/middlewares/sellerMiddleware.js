import SellerProfile from "../models/SellerProfile.js";

export const ensureActiveSeller = async (req, res, next) => {
  try {
    if (req.user?.role === "admin" || req.user?.role === "staff") {
      return next();
    }

    if (req.user?.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Seller account required",
        data: null,
      });
    }

    const profile = await SellerProfile.findOne({
      userId: req.user._id,
      isDeleted: { $ne: true },
    }).select("isVerified isActive onboardingStatus");

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: "Seller profile not found",
        data: null,
      });
    }

    const onboardingApproved = profile.onboardingStatus === "approved";

    if (!profile.isVerified || !profile.isActive || !onboardingApproved) {
      return res.status(403).json({
        success: false,
        message: "Seller account is pending approval or inactive",
        data: {
          isVerified: profile.isVerified,
          isActive: profile.isActive,
          onboardingStatus: profile.onboardingStatus,
        },
      });
    }

    req.sellerProfile = profile;
    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

/**
 * Same as full activation for catalog/inventory, but does NOT require isActive.
 * Sellers must be able to see incoming orders after approval even if an admin
 * toggled "inactive" (or legacy data had isActive false).
 */
export const ensureSellerCanViewOrders = async (req, res, next) => {
  try {
    if (req.user?.role === "admin" || req.user?.role === "staff") {
      return next();
    }

    if (req.user?.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Seller account required",
        data: null,
      });
    }

    const profile = await SellerProfile.findOne({
      userId: req.user._id,
      isDeleted: { $ne: true },
    }).select("isVerified isActive onboardingStatus");

    if (!profile) {
      return res.status(403).json({
        success: false,
        message: "Seller profile not found",
        data: null,
      });
    }

    const onboardingApproved = profile.onboardingStatus === "approved";

    if (!profile.isVerified || !onboardingApproved) {
      return res.status(403).json({
        success: false,
        message: "Seller account is pending approval or inactive",
        data: {
          isVerified: profile.isVerified,
          isActive: profile.isActive,
          onboardingStatus: profile.onboardingStatus,
        },
      });
    }

    req.sellerProfile = profile;
    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
