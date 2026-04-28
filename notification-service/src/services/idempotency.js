/**
 * In-memory idempotency for eventId. For production, replace with Redis or a DB table
 * (see README — same /events contract works for a queue worker).
 */
const seen = new Map();
const MAX = 50_000;

export function isDuplicateEventId(eventId) {
  if (seen.has(eventId)) return true;
  if (seen.size >= MAX) {
    const firstKey = seen.keys().next().value;
    if (firstKey) seen.delete(firstKey);
  }
  seen.set(eventId, Date.now());
  return false;
}
