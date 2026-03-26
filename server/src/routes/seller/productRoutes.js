import express from "express";
import {
  createMyProduct,
  getMyProducts,
  updateMyProduct,
} from "../../controllers/seller/sellerProductController.js";

const router = express.Router();

router.get("/", getMyProducts);
router.post("/", createMyProduct);
router.put("/:productId", updateMyProduct);

export default router;
