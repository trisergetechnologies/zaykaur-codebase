import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import adminRoutes from "./admin/index.js";
import authRoutes from "./auth/authRoutes.js";
import customerRoutes from "./customer/index.js";
import publicRoutes from "./public/index.js";
import sellerRoutes from "./seller/index.js";
import uploadRoutes from "./uploadRoutes.js";
import userRoutes from "./user/userRoutes.js";

const router = express.Router();

//Auth Routes
router.use('/auth', authRoutes);



//Common Routes
router.use("/user", protect, userRoutes);



//Customer Routes
router.use("/customer", protect, authorizeRoles("customer"), customerRoutes);

//Seller Routes
router.use("/seller", protect, sellerRoutes);

//Admin Routes
router.use("/admin", protect, authorizeRoles("admin", "staff"), adminRoutes);

//Upload Routes (authenticated)
router.use("/upload", protect, uploadRoutes);

router.use("/public", publicRoutes);


export default router;