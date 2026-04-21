import express from "express";
import {
  approveProduct,
  getPendingProductById,
  getPendingProducts,
  rejectProduct,
} from "../../controllers/admin/adminProductController.js";

const router = express.Router();

router.get("/pending", getPendingProducts);
router.get("/pending/:productId", getPendingProductById);
// POST + PATCH: some proxies/clients handle POST more reliably for action endpoints.
router.post("/:productId/approve", approveProduct);
router.patch("/:productId/approve", approveProduct);
router.post("/:productId/reject", rejectProduct);
router.patch("/:productId/reject", rejectProduct);

export default router;
