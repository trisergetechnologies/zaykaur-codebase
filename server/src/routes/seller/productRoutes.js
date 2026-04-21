import express from "express";
import {
  createMyProduct,
  getMyProductById,
  getMyProducts,
  updateMyProduct,
} from "../../controllers/seller/sellerProductController.js";

const router = express.Router();

router.get("/", getMyProducts);
router.post("/", createMyProduct);
router.get("/:productId", getMyProductById);
router.put("/:productId", updateMyProduct);

export default router;
