import express from "express";
import { applyCoupon, removeCoupon } from "../../controllers/couponController.js";

const router = express.Router();

router.post("/apply", applyCoupon);
router.delete("/remove", removeCoupon);

export default router;
