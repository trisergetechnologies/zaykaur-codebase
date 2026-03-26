import express from "express";
import addressRoutes from './addressRoutes.js';
import cartRoutes from './cartRoutes.js';
import couponRoutes from './couponRoutes.js';
import orderRoutes from './orderRoutes.js';
import returnRoutes from './returnRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import wishlistRoutes from "./wishlistRoutes.js";

const router = express.Router();

router.use('/cart', cartRoutes);
router.use('/address', addressRoutes);
router.use('/coupon', couponRoutes);
router.use('/order', orderRoutes);
router.use('/returns', returnRoutes);
router.use('/reviews', reviewRoutes);
router.use("/wishlist", wishlistRoutes);

export default router;
