/**
 * Mirrors server/src/lib/orderLifecycle.js — used to show only valid next statuses in admin UI.
 */

export const ORDER_STATUS_CHAIN = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "in_transit",
  "out_for_delivery",
  "delivered",
] as const;

export const ORDER_STATUS_FLOW: Record<string, string[]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["in_transit", "returned"],
  in_transit: ["out_for_delivery", "returned"],
  out_for_delivery: ["delivered", "returned"],
  delivered: ["returned"],
  returned: [],
  cancelled: [],
};

function normalize(s: string) {
  return String(s ?? "")
    .trim()
    .toLowerCase();
}

/** All statuses an admin can select for the dropdown (union of chain + terminals). */
export const ALL_ORDER_STATUSES = [
  ...ORDER_STATUS_CHAIN,
  "cancelled",
  "returned",
] as const;

/**
 * Valid next statuses from current — must match server `canTransitionOrderStatus`
 * (ORDER_STATUS_FLOW only). Do not add “skip ahead” steps from ORDER_STATUS_CHAIN
 * or the UI will offer illegal targets (e.g. shipped → delivered).
 */
export function getValidNextOrderStatuses(current: string): string[] {
  const c = normalize(current);
  const allowed = ORDER_STATUS_FLOW[c] ?? [];
  return ALL_ORDER_STATUSES.filter((s) => allowed.includes(s));
}

export function formatStatusLabel(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
