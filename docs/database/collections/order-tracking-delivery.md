# Order tracking and delivery

Orders can have multiple **shipments** (e.g. one per seller or partial dispatch). Each shipment has its own carrier, AWB, and tracking events. Delivery can use **third-party integrated providers** or **manual** entry (fallback).

## Shipments (embedded in orders)

Stored as `orders.shipments[]`. One order can have multiple shipment subdocuments.

### Shipment schema (embedded)

| Field | Type | Required | Use |
|-------|------|----------|-----|
| `_id` / shipmentId | ObjectId | auto | Unique per shipment |
| sellerId | ObjectId | yes | ref User (seller who ships this) |
| items | [Number] or [ObjectId] | no | Order item indices or refs to items in this shipment |
| status | String | yes | Same enum as orderStatus for this shipment |
| carrierCode | String | yes | e.g. BLUEDART, DELHIVERY, MANUAL |
| carrierName | String | no | Display name for UI |
| awbNumber | String | no | AWB/tracking number |
| trackingUrl | String | no | Deep link for tracking |
| providerId | ObjectId | no | ref delivery_providers when integrated |
| dispatchedAt | Date | no | When shipped |
| deliveredAt | Date | no | When delivered |
| events | [{ at, status, location, description }] | no | Timeline; appended by webhook or manual |

### Events array shape

| Field | Type | Use |
|-------|------|-----|
| at | Date | When event occurred |
| status | String | e.g. shipped, in_transit, out_for_delivery, delivered |
| location | String | Optional |
| description | String | Optional human-readable |

### Flow

1. **Order created** — Order has items; no shipments yet or placeholder shipments created.
2. **Shipment creation** — Seller/admin creates shipment (selects items, chooses carrier). If third-party: Server calls provider API to create shipment and gets AWB; else `carrierCode: MANUAL`, admin/seller enters `carrierName`, `awbNumber`, optional `trackingUrl`.
3. **Updates** — Integrated: provider sends webhook; Server appends to `events[]` and updates `status`, `dispatchedAt`, `deliveredAt`. Manual: admin/seller appends to `events[]` and updates status.
4. **Idempotency** — Webhook handlers must use idempotency key (e.g. in `idempotency_keys` collection or payload id) to avoid duplicate updates.

---

## Collection: delivery_providers

Stores third-party carrier configuration. When `isIntegrated` is true and `carrierCode` matches, Server uses this for API calls; otherwise shipment is manual.

### Schema

| Field | Type | Required | Index | Use |
|-------|------|----------|-------|-----|
| code | String | yes | unique | e.g. BLUEDART, DELHIVERY; used in shipment.carrierCode |
| name | String | yes | — | Display name |
| isIntegrated | Boolean | yes | — | true = use API; false = manual entry only |
| apiConfig | String / Object | no | — | Reference to vault or encrypted config; never plain keys in DB |
| webhookUrl | String | no | — | Our endpoint for provider callbacks (or document in config) |
| isActive | Boolean | no | yes | Default true |
| createdAt | Date | auto | — | |
| updatedAt | Date | auto | — | |

### Fallback

- When `carrierCode` = `MANUAL` or no matching active integrated provider: admin/seller enters `carrierName`, `awbNumber`, optional `trackingUrl`. Tracking events added manually (append to `events[]`).
- Seller profile can store `defaultDeliveryProvider` (code or ref) for quick selection.

---

## Idempotency for webhooks

To avoid duplicate status updates from delivery provider webhooks:

- Store idempotency key (e.g. provider event id or request id) in a small collection e.g. `idempotency_keys`: `{ key: string, createdAt: date }` with TTL index, or store on shipment/order.
- Before applying webhook: check key; if exists, return 200 without updating; else apply update and store key.

See [data-integrity.md](../data-integrity.md).
