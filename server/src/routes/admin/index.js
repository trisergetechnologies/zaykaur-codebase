import express from "express";

import couponRoutes from "./couponRoutes.js";
import customerRoutes from "./customerRoutes.js";
import orderRoutes from "./orderRoutes.js";
import reportRoutes from "./reportRoutes.js";
import returnRoutes from "./returnRoutes.js";
import sellerRoutes from "./sellerRoutes.js";

const router = express.Router();

router.use("/coupons", couponRoutes);
router.use("/customers", customerRoutes);
router.use("/returns", returnRoutes);
router.use("/sellers", sellerRoutes);
router.use("/reports", reportRoutes);
router.use("/orders", orderRoutes);

export default router;
