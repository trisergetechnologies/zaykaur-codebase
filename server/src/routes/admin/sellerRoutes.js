import express from "express";
import {
  activateSeller,
  approveSeller,
  getPendingSellerOnboarding,
  getSellers,
  rejectSeller,
} from "../../controllers/admin/sellerAdminController.js";

const router = express.Router();

router.get("/pending", getPendingSellerOnboarding);
router.get("/", getSellers);
router.patch("/:sellerProfileId/approve", approveSeller);
router.patch("/:sellerProfileId/reject", rejectSeller);
router.patch("/:sellerProfileId/activate", activateSeller);

export default router;
