import express from "express";
import { getAllProducts, getSingleProduct, getProductBySlug } from "../../controllers/products/productController.js";
import { getCategories } from "../../controllers/categoryController.js";
import { handleDeliveryWebhook } from "../../controllers/delivery/webhookController.js";
import { getProductReviews } from "../../controllers/reviewController.js";
import {
  getPublicHomepage,
  getPublicHomepageCurated,
} from "../../controllers/homepageController.js";

const router = express.Router();

router.get("/homepage/curated/:slug", getPublicHomepageCurated);
router.get("/homepage", getPublicHomepage);
router.get("/products", getAllProducts);
router.get("/products/single/:productId", getSingleProduct);
router.get("/products/slug/:slug", getProductBySlug);
router.get("/products/:productId/reviews", getProductReviews);
router.get("/categories", getCategories);
router.post("/delivery/webhooks/:providerCode", handleDeliveryWebhook);

export default router;
