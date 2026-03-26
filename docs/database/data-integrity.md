# Data integrity

Principles and implementation notes for no data loss, immutability, soft deletes, and idempotency. Gateway logs (e.g. Winston) are separate; this doc focuses on database and Server behavior.

---

## No data loss

### Orders are immutable

- After order creation, **do not update** `items[]`, `shippingAddress`, `billingAddress`, or any monetary fields (`subtotal`, `taxTotal`, `grandTotal`, line `unitPrice`, `taxAmount`, `lineTotal`).
- Allowed updates: `orderStatus`, `paymentStatus`, `paymentId`, `paidAt`, `confirmedAt`, `shippedAt`, `deliveredAt`, and **shipments** (tracking, events, status).
- Rationale: Even if product is deleted or price changed, order history remains accurate for support, returns, and compliance.

### Snapshots, not references

- Order stores **snapshot** of address (fullName, phone, street, city, state, postalCode, country). No reference to user’s address document. If user deletes an address, past orders are unchanged.
- Order line items store **snapshot** of name, sku, unitPrice, taxRate, taxAmount, lineTotal, and optional productSnapshot. `productId` and `variantId` are kept for linking to product page only; display uses snapshot.

### References that may disappear

- **Soft references:** `productId`, `variantId` on order item may point to soft-deleted product. Server should not cascade delete orders; orders keep snapshot. When displaying, "product no longer available" is fine.
- **Hard reference:** `userId` on order must always point to a user (soft-deleted users still exist). When user is hard-deleted (if ever), define policy: e.g. anonymize or keep ref and show "Deleted user" in admin.

---

## Soft deletes

Used for: **users**, **seller_profiles**, **products**, **categories**.

- Set `isDeleted: true` and `deletedAt: new Date()` instead of removing the document.
- **Reads:** All normal listing/detail APIs filter `isDeleted: false` (or equivalent). Admin "show deleted" can omit this filter.
- **No cascade delete:** Soft-deleting a user does not soft-delete their orders or carts. Orders retain snapshot; carts can be cleared or left as-is (define in Server).
- **Uniqueness:** For unique fields (email, slug), either allow duplicate after soft delete (e.g. same email for new account) or use compound unique index `(email, isDeleted)` and keep one "deleted" document per email. Document the choice in Server.

---

## Idempotency

### Payment webhooks

- Provider may retry. Store idempotency key (e.g. gateway payment id or webhook event id) before applying update.
- **Option A:** Collection `idempotency_keys`: `{ key: string, createdAt: date }`. Before updating order: if key exists, return success without update; else insert key and apply update. Use TTL index on `createdAt` to expire keys (e.g. 24h).
- **Option B:** Store `lastProcessedPaymentId` (or similar) on order; if incoming id equals it, skip.

### Delivery webhooks

- Same idea: provider sends tracking update; use idempotency key (e.g. event id) so duplicate webhooks do not append duplicate events or change status twice.
- Store key in `idempotency_keys` or in shipment document (e.g. `lastWebhookEventId`).

---

## Cascade and validation

- **No DB-level cascade:** MongoDB does not enforce foreign keys. Server must enforce:
  - Order creation: `userId` exists and is customer; cart items’ product/variant exist and are active.
  - Category: `parent` exists and is not self; no circular ancestor chain.
  - Product: `seller` exists and has seller_profiles; `category` exists and is active.
- **Category tree:** On save, Server computes `ancestors` and `level` from `parent` and validates no cycle (e.g. parent not in ancestors).

---

## Summary

| Area | Rule |
|------|------|
| Orders | Immutable snapshot for items and addresses; only status and shipments can change |
| Snapshots | Store copy of address and line details at order time; no ref to mutable data |
| Soft deletes | isDeleted + deletedAt; filter in reads; no cascade delete |
| Idempotency | Use keys for payment and delivery webhooks to prevent duplicate updates |
| References | Document soft vs hard refs; define behavior when referenced document is deleted |
