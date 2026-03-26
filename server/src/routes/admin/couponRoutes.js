import express from "express";
import { createCoupon, getCoupons, updateCoupon, deleteCoupon } from "../../controllers/couponController.js";

const router = express.Router();

router.get("/", getCoupons);
router.post("/", createCoupon);
router.put("/:couponId", updateCoupon);
router.delete("/:couponId", deleteCoupon);

export default router;
