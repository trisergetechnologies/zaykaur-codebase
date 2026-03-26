import express from "express";
import { getInventory, updateStock, bulkUpdateStock, getLowStockAlerts } from "../../controllers/seller/inventoryController.js";

const router = express.Router();

router.get("/", getInventory);
router.get("/low-stock", getLowStockAlerts);
router.patch("/:productId/:variantId", updateStock);
router.post("/bulk", bulkUpdateStock);

export default router;
