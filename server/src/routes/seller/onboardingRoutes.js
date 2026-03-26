import express from "express";
import {
  getMyOnboardingStatus,
  saveOnboardingDraft,
  submitSellerOnboarding,
} from "../../controllers/seller/onboardingController.js";

const router = express.Router();

router.get("/me", getMyOnboardingStatus);
router.post("/draft", saveOnboardingDraft);
router.post("/submit", submitSellerOnboarding);

export default router;
