import express from "express";
import { createReturnRequest, getMyReturnRequests } from "../../controllers/returnController.js";

const router = express.Router();

router.post("/", createReturnRequest);
router.get("/", getMyReturnRequests);

export default router;
