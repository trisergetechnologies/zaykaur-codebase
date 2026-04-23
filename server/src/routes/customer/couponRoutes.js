import express from "express";
import { applyCoupon, removeCoupon, getCheckoutCoupons } from "../../controllers/couponController.js";

const router = express.Router();

router.get("/checkout-offers", getCheckoutCoupons);
router.post("/apply", applyCoupon);
router.delete("/remove", removeCoupon);

export default router;
