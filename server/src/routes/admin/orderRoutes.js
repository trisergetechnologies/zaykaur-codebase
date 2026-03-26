import express from "express";
import {
  getAdminOrderById,
  getAdminOrders,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "../../controllers/admin/orderAdminController.js";

const router = express.Router();

router.get("/", getAdminOrders);
router.get("/:orderId", getAdminOrderById);
router.patch("/:orderId/status", updateOrderStatus);
router.patch("/:orderId/payment", updateOrderPaymentStatus);

export default router;
