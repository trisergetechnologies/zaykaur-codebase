import express from "express";
import { getMyProfile, updateMyProfile } from "../../controllers/user/userController.js";
import notificationRoutes from "./notificationRoutes.js";

const router = express.Router();

router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);
router.use("/notifications", notificationRoutes);

export default router;
