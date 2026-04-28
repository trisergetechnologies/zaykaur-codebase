import express from "express";
import logger from "../logger.js";
import { isDuplicateEventId } from "../services/idempotency.js";
import { handleEvent } from "../services/orchestrator.js";

const router = express.Router();

function requireSecret(req, res, next) {
  const expected = process.env.NOTIFICATION_SERVICE_SECRET?.trim();
  if (!expected) {
    logger.error("NOTIFICATION_SERVICE_SECRET is not set (check notification-service/.env and cwd; see loadEnv.js)");
    return res.status(503).json({ success: false, message: "Service misconfigured" });
  }
  const sent = String(req.headers["x-notification-secret"] ?? "").trim();
  if (sent !== expected) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
}

router.post("/", requireSecret, async (req, res) => {
  try {
    const body = req.body || {};
    const { eventId, eventType, occurredAt, source, data } = body;

    if (!eventId || typeof eventId !== "string") {
      return res.status(400).json({ success: false, message: "eventId is required" });
    }
    if (!eventType || typeof eventType !== "string") {
      return res.status(400).json({ success: false, message: "eventType is required" });
    }

    if (isDuplicateEventId(eventId)) {
      logger.info({ eventId, eventType }, "duplicate eventId — idempotent accept");
      return res.status(202).json({ success: true, message: "duplicate ignored", duplicate: true });
    }

    await handleEvent({
      eventId,
      eventType,
      occurredAt,
      source,
      data,
    });

    return res.status(202).json({ success: true, message: "accepted" });
  } catch (err) {
    logger.error({ err: err.message, stack: err.stack }, "POST /events failed");
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
