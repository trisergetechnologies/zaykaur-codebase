import express from "express";

import { authorizeRoles } from "../../middlewares/roleMiddleware.js";
import { ensureActiveSeller, ensureSellerCanViewOrders } from "../../middlewares/sellerMiddleware.js";
import inventoryRoutes from "./inventoryRoutes.js";
import onboardingRoutes from "./onboardingRoutes.js";
import orderRoutes from "./orderRoutes.js";
import productRoutes from "./productRoutes.js";
import reportRoutes from "./reportRoutes.js";
import returnRoutes from "./returnRoutes.js";
import shipmentRoutes from "./shipmentRoutes.js";

const router = express.Router();

router.use("/onboarding", authorizeRoles("customer", "seller", "admin", "staff"), onboardingRoutes);
router.use("/orders", authorizeRoles("seller", "admin", "staff"), ensureSellerCanViewOrders, orderRoutes);
router.use("/inventory", authorizeRoles("seller", "admin", "staff"), ensureActiveSeller, inventoryRoutes);
router.use("/products", authorizeRoles("seller", "admin", "staff"), ensureActiveSeller, productRoutes);
router.use("/reports", authorizeRoles("seller", "admin", "staff"), ensureActiveSeller, reportRoutes);
router.use("/returns", authorizeRoles("seller", "admin", "staff"), ensureActiveSeller, returnRoutes);
router.use("/shipments", authorizeRoles("seller", "admin", "staff"), ensureActiveSeller, shipmentRoutes);

export default router;
