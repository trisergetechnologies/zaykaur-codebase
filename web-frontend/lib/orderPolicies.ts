/**
 * Customer-facing order / return policy copy.
 * RETURN_WINDOW_DAYS must match server `CUSTOMER_RETURN_WINDOW_DAYS` in
 * server/src/controllers/returnController.js
 */
export const RETURN_WINDOW_DAYS = 15;

export const REFUND_TIMELINE_DAYS_MIN = 5;
export const REFUND_TIMELINE_DAYS_MAX = 10;

export const STORE_LEGAL_NAME = "Zaykaur";

export const RETURN_POLICY_HIGHLIGHTS = [
  {
    title: "Return window",
    body: `You can raise a return within ${RETURN_WINDOW_DAYS} days from the delivery date for eligible items.`,
  },
  {
    title: "Condition",
    body:
      "Items should be unused, with original tags/packaging where applicable. Certain categories (e.g. innerwear, opened consumables) may be non-returnable as per law and seller policy.",
  },
  {
    title: "Pickup & refund",
    body:
      "After approval, we may schedule a pickup. Refunds are typically processed within 5–10 business days after the item is received and verified, to your original payment method.",
  },
  {
    title: "One request per order",
    body:
      "Only one open return request is allowed per order. Contact support if you need changes after submitting.",
  },
] as const;

export function getReturnWindowEndDate(deliveredAtIso: string | undefined): Date | null {
  if (!deliveredAtIso) return null;
  const d = new Date(deliveredAtIso);
  if (Number.isNaN(d.getTime())) return null;
  const end = new Date(d);
  end.setDate(end.getDate() + RETURN_WINDOW_DAYS);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** Whole calendar days remaining before window end; 0 = last day; negative if expired. */
export function getReturnDaysRemaining(deliveredAtIso: string | undefined): number | null {
  if (!deliveredAtIso) return null;
  const end = getReturnWindowEndDate(deliveredAtIso);
  if (!end) return null;
  const ms = end.getTime() - Date.now();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
