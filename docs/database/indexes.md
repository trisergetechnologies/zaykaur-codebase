# Database indexes

All indexes with rationale. Server must create these (e.g. in Mongoose schema or migration).

---

## users

| Index | Type | Rationale |
|-------|------|-----------|
| `email` | unique | Login and uniqueness; fast lookup by email |
| `phone` | unique, sparse | Uniqueness when present; sparse allows multiple nulls |
| `role` | single | Admin/seller listing; filter by role |
| `isDeleted` | single | All reads filter isDeleted: false; include in compound if needed |

---

## seller_profiles

| Index | Type | Rationale |
|-------|------|-----------|
| `userId` | unique | One profile per seller; lookup by user |
| `slug` | unique | Resolve store by URL (/store/:slug) |
| `isActive` | single | List active sellers; filter inactive |

---

## categories

| Index | Type | Rationale |
|-------|------|-----------|
| `parent` | single | List direct children of a category |
| `ancestors` | single (array) | List all descendants; breadcrumb by ancestor |
| `slug` | unique | Resolve category by URL |
| `{ isActive: 1, level: 1, displayOrder: 1 }` | compound | Listing: active categories by level and sibling order |

---

## products

| Index | Type | Rationale |
|-------|------|-----------|
| `seller` | single | Seller dashboard: all products of a seller |
| `category` | single | Listing by primary category |
| `categories` | single (multikey) | Listing by any assigned category |
| `status` | single | Filter active/draft/discontinued |
| `slug` | unique | Resolve product by URL |
| `isDeleted` | single | Exclude deleted in reads |
| Optional: text index on `name`, `description`, `attributes` | text | Full-text search |

Embedded variants: SKU uniqueness enforced in application (no unique index on subdocuments).

---

## tax_rules

| Index | Type | Rationale |
|-------|------|-----------|
| `code` | single / unique | Lookup by product.taxCode |
| `isActive` | single | Only active rules for resolution |
| `{ effectiveFrom: 1, effectiveTo: 1 }` or separate | single | Time-bound rule validity |

---

## orders

| Index | Type | Rationale |
|-------|------|-----------|
| `userId` | single | My orders; list by buyer |
| `orderNumber` | unique | Lookup by order number; idempotency |
| `orderStatus` | single | Filter by status (e.g. pending, shipped) |
| `createdAt` | single | Sort recent first; date range queries |
| `paymentStatus` | single | Filter paid/pending/failed |
| `items.sellerId` + `createdAt` | compound (multikey) | Seller reports: orders containing seller’s items, by date |

---

## delivery_providers

| Index | Type | Rationale |
|-------|------|-----------|
| `code` | unique | Match shipment.carrierCode |
| `isActive` | single | Only active providers for dropdown |

---

## carts

| Index | Type | Rationale |
|-------|------|-----------|
| `userId` | unique | One cart per user; fast lookup |

---

## wishlists

| Index | Type | Rationale |
|-------|------|-----------|
| `userId` | single | List user’s wishlist |
| `productId` | single | Analytics: most wishlisted |
| `{ userId: 1, productId: 1, variantId: 1 }` | unique compound | Prevent duplicate (userId, productId, variantId) |

---

## product_recommendations

| Index | Type | Rationale |
|-------|------|-----------|
| `productId` | single | All recommendations for a product |
| `{ productId: 1, source: 1 }` | compound | Filter by source (manual vs AI) |
| Optional: `{ productId: 1, recommendedProductId: 1, source: 1 }` | unique compound | No duplicate (product, recommended, source) |

---

## idempotency_keys (optional)

| Index | Type | Rationale |
|-------|------|-----------|
| `key` | unique | Reject duplicate webhook/request by key |
| `createdAt` | single, TTL | Expire old keys (e.g. 24h) to avoid unbounded growth |

---

Indexes should be created in Server via Mongoose schema options or a one-time migration script. Monitor slow queries and add compound indexes as needed (e.g. `userId` + `createdAt` on orders for "my orders" pagination).
