# Cart and wishlist

## Collection: carts

One document per user. Items reference product, variant (if any), and seller. Totals are **estimates** until order creation; Server recalculates from current product/variant and tax at checkout.

### Schema

| Field | Type | Required | Index | Use |
|-------|------|----------|-------|-----|
| userId | ObjectId | yes | unique | ref User |
| items | [CartItem] | yes | — | Embedded array |
| itemsTotal | Number | no | — | Estimate; recomputed on read or on update |
| taxTotal | Number | no | — | Estimate |
| shippingEstimate | Number | no | — | Estimate |
| grandTotal | Number | no | — | Estimate |
| currency | String | no | — | Default INR |
| createdAt | Date | auto | — | |
| updatedAt | Date | auto | — | |

### Embedded cart item shape

| Field | Type | Required | Use |
|-------|------|----------|-----|
| productId | ObjectId | yes | ref Product |
| variantId | ObjectId | no | ref variant _id; omit for product without variants |
| quantity | Number | yes | min 1 |
| sellerId | ObjectId | yes | ref User (seller) |
| addedAt | Date | no | For sort/display |
| unitPrice | Number | no | Cached for display; refreshed on load or when price changes |
| name | String | no | Cached for display |
| image | String | no | Cached for display |

At checkout, Server ignores cached price/name/image and recalculates from current product/variant and tax rules; then writes order snapshot.

### Indexes

- `userId` (unique) — one cart per user.

---

## Collection: wishlists

Separate collection for scale and analytics (e.g. "most wishlisted products"). Alternative: embed `wishlist` array on users (array of Product refs); use wishlists collection when list is large or you need per-item metadata.

### Schema

| Field | Type | Required | Index | Use |
|-------|------|----------|-------|-----|
| userId | ObjectId | yes | yes | ref User |
| productId | ObjectId | yes | yes | ref Product |
| variantId | ObjectId | no | — | Optional; specific variant wishlisted |
| addedAt | Date | no | yes | For sort; default now |

Compound unique index on `(userId, productId, variantId)` so same product/variant is not duplicated per user.

### Indexes

- `userId` — list user’s wishlist.
- `productId` — analytics (e.g. count by product).
- Unique: `(userId, productId, variantId)`.

See [indexes.md](../indexes.md) for full definitions.
