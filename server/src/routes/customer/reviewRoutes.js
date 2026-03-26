import express from "express";
import { createReview, updateReview, deleteReview } from "../../controllers/reviewController.js";

const router = express.Router();

router.post("/", createReview);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);

export default router;
