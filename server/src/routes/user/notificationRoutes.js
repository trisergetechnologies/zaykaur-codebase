import express from "express";
import { getMyNotifications, markAsRead, markAllAsRead } from "../../controllers/notificationController.js";

const router = express.Router();

router.get("/", getMyNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:notificationId/read", markAsRead);

export default router;
