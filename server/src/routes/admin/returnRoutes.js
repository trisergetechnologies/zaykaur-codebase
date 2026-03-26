import express from "express";
import { getAllReturnRequests, adminOverrideReturn } from "../../controllers/returnController.js";

const router = express.Router();

router.get("/", getAllReturnRequests);
router.patch("/:returnId/override", adminOverrideReturn);

export default router;
