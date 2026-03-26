import express from "express";
import { getSellerReturnRequests, updateReturnStatus } from "../../controllers/returnController.js";

const router = express.Router();

router.get("/", getSellerReturnRequests);
router.patch("/:returnId/status", updateReturnStatus);

export default router;
