import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../../controllers/products/wishlistController.js";

const router = express.Router();

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
