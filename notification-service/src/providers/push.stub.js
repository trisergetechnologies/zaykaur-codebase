import logger from "../logger.js";

/**
 * Phase 2: wire Firebase Admin (FCM) here. Same function signature.
 */
export async function sendPush(_event) {
  logger.debug("push stub: FCM not configured, no-op");
  return { sent: false, reason: "stub" };
}
