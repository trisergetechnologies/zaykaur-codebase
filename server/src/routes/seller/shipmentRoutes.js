import express from "express";
import {
  createShipment,
  getOrderShipmentsForSeller,
  updateShipmentStatus,
} from "../../controllers/seller/shipmentController.js";

const router = express.Router();

router.get("/orders/:orderId", getOrderShipmentsForSeller);
router.post("/", createShipment);
router.patch("/:orderId/:shipmentId/status", updateShipmentStatus);

export default router;
