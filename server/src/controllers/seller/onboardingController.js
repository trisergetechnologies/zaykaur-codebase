import SellerProfile from "../../models/SellerProfile.js";
import { slugify, validateOnboardingDocuments } from "../../lib/sellerProductValidation.js";

const toSellerDocuments = (documents = []) =>
  documents.map((document) => ({
    documentType: String(document.documentType || "").toLowerCase().trim(),
    documentNumber: document.documentNumber || "",
    documentUrl: document.documentUrl || "",
    uploadedAt: document.uploadedAt ? new Date(document.uploadedAt) : new Date(),
  }));

const parseBusinessAddress = (businessAddress = {}) => ({
  street: businessAddress.street || "",
  city: businessAddress.city || "",
  state: businessAddress.state || "",
  postalCode: businessAddress.postalCode || "",
  country: businessAddress.country || "India",
});

export const getMyOnboardingStatus = async (req, res) => {
  try {
    const profile = await SellerProfile.findOne({
      userId: req.user._id,
      isDeleted: { $ne: true },
    }).lean();

    if (!profile) {
      return res.status(200).json({
        success: true,
        message: "Seller onboarding not started",
        data: {
          onboardingStatus: "draft",
          requiredDocumentTypes: ["gstin", "pan", "bank"],
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Seller onboarding fetched successfully",
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

export const saveOnboardingDraft = async (req, res) => {
  try {
    const {
      shopName,
      slug,
      description,
      logo,
      gstin,
      pan,
      businessAddress,
      bankAccountDetails,
      documents = [],
      commissionRate,
      autoAcceptOrder,
      defaultDeliveryProvider,
    } = req.body;

    const profile =
      (await SellerProfile.findOne({ userId: req.user._id, isDeleted: { $ne: true } })) ||
      new SellerProfile({ userId: req.user._id });

    const resolvedShopName = shopName || profile.shopName;
    if (!resolvedShopName) {
      return res.status(200).json({
        success: false,
        message: "shopName is required to start onboarding draft",
        data: null,
      });
    }

    profile.shopName = resolvedShopName;

    const resolvedSlug = slugify(slug || resolvedShopName || profile.slug || "");
    if (!resolvedSlug) {
      return res.status(200).json({
        success: false,
        message: "slug is required to start onboarding draft",
        data: null,
      });
    }

    if (resolvedSlug) {
      const existingSlug = await SellerProfile.findOne({
        slug: resolvedSlug,
        userId: { $ne: req.user._id },
      }).select("_id");
      if (existingSlug) {
        return res.status(200).json({
          success: false,
          message: "Slug already in use by another seller",
          data: null,
        });
      }
      profile.slug = resolvedSlug;
    }

    if (description != null) profile.description = description;
    if (logo != null) profile.logo = logo;
    if (gstin != null) profile.gstin = gstin;
    if (pan != null) profile.pan = pan;
    if (bankAccountDetails != null) profile.bankAccountDetails = bankAccountDetails;
    if (businessAddress) profile.businessAddress = parseBusinessAddress(businessAddress);
    if (documents.length) profile.documents = toSellerDocuments(documents);
    if (commissionRate != null) profile.commissionRate = Number(commissionRate) || 0;
    if (autoAcceptOrder != null) profile.autoAcceptOrder = Boolean(autoAcceptOrder);
    if (defaultDeliveryProvider != null) profile.defaultDeliveryProvider = defaultDeliveryProvider;

    if (!profile.onboardingStatus || profile.onboardingStatus === "draft" || profile.onboardingStatus === "rejected") {
      profile.onboardingStatus = "draft";
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Seller onboarding draft saved",
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

export const submitSellerOnboarding = async (req, res) => {
  try {
    const {
      shopName,
      slug,
      description,
      logo,
      gstin,
      pan,
      businessAddress,
      bankAccountDetails,
      documents = [],
      commissionRate,
      autoAcceptOrder,
      defaultDeliveryProvider,
    } = req.body;

    if (!shopName || !gstin || !pan || !bankAccountDetails) {
      return res.status(200).json({
        success: false,
        message: "shopName, gstin, pan and bankAccountDetails are required",
        data: null,
      });
    }

    if (!businessAddress?.street || !businessAddress?.city || !businessAddress?.state || !businessAddress?.postalCode) {
      return res.status(200).json({
        success: false,
        message: "Complete businessAddress is required",
        data: null,
      });
    }

    const documentValidation = validateOnboardingDocuments(documents);
    if (!documentValidation.ok) {
      return res.status(200).json({
        success: false,
        message: documentValidation.message,
        data: null,
      });
    }

    const resolvedSlug = slugify(slug || shopName);
    if (!resolvedSlug) {
      return res.status(200).json({
        success: false,
        message: "A valid slug or shopName is required",
        data: null,
      });
    }

    const existingSlug = await SellerProfile.findOne({
      slug: resolvedSlug,
      userId: { $ne: req.user._id },
    }).select("_id");
    if (existingSlug) {
      return res.status(200).json({
        success: false,
        message: "Slug already in use by another seller",
        data: null,
      });
    }

    const profile =
      (await SellerProfile.findOne({ userId: req.user._id, isDeleted: { $ne: true } })) ||
      new SellerProfile({ userId: req.user._id });

    profile.shopName = shopName;
    profile.slug = resolvedSlug;
    profile.description = description || "";
    profile.logo = logo || "";
    profile.gstin = gstin;
    profile.pan = pan;
    profile.businessAddress = parseBusinessAddress(businessAddress);
    profile.bankAccountDetails = bankAccountDetails;
    profile.documents = toSellerDocuments(documents);
    profile.commissionRate = Number(commissionRate) || 0;
    profile.autoAcceptOrder = Boolean(autoAcceptOrder);
    profile.defaultDeliveryProvider = defaultDeliveryProvider || "";
    profile.onboardingStatus = "pending_approval";
    profile.submittedAt = new Date();
    profile.reviewedAt = null;
    profile.reviewedBy = null;
    profile.reviewNote = "";
    profile.isVerified = false;
    profile.isActive = false;
    profile.approvalHistory.push({
      action: "submitted",
      by: req.user._id,
      note: "Seller onboarding submitted",
      at: new Date(),
    });

    await profile.save();

    if (req.user.role !== "seller") {
      req.user.role = "seller";
      await req.user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Seller onboarding submitted. Waiting for admin approval.",
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
