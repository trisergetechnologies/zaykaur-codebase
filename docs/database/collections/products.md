# Products and variants

Products use **embedded variants** (Option A). Each product has one or more variants (e.g. size, color) with their own SKU, price, stock, and images.

## Collection: products

Common fields at product level; variant-specific fields in embedded `variants[]`.

### Schema

| Field | Type | Required | Index | Use |
|-------|------|----------|-------|-----|
| `name` | String | yes | — | Product title; max 150 chars |
| `slug` | String | yes | yes | URL-safe; unique per product (global or per-seller by design choice) |
| `description` | String | yes | — | Full description |
| `seller` | ObjectId | yes | yes | ref User (seller) |
| `category` | ObjectId | yes | yes | ref Category (primary) |
| `categories` | [ObjectId] | no | yes | Additional category refs for multi-category listing |
| `brand` | String | no | — | Brand name (or ref Brand collection if added later) |
| `status` | String | yes | yes | `draft` \| `active` \| `out_of_stock` \| `discontinued`; default `draft` |
| `attributes` | Object | no | — | Key/value for search/filter (e.g. fabric, material); product-level attributes |
| `taxCode` | String | no | — | Code from tax_rules (e.g. GST_12); or `taxId` (ObjectId ref) |
| `variantAttributeDefs` | Array | no | — | Defines variant selectors (e.g. RAM, Storage for electronics; Size, Color for clothes). Each item: `{ key, label, options[], displayOrder }`. Backend computes `variantSelectors` for frontend. |
| `variants` | [Variant] | yes | — | Embedded array; at least one variant |
| `isDeleted` | Boolean | no | yes | Soft delete; default false |
| `deletedAt` | Date | no | — | Set when soft-deleted |
| `createdAt` | Date | auto | — | |
| `updatedAt` | Date | auto | — | |

### Embedded variant shape (variants[])

| Field | Type | Required | Use |
|-------|------|----------|-----|
| `_id` | ObjectId | auto | Use as variantId in cart/order |
| `sku` | String | yes | Unique across platform; application-level uniqueness if embedded |
| `attributes` | Object | no | e.g. `{ size: "M", color: "Red" }` for display and filter |
| `price` | Number | yes | Selling price; min 0 |
| `mrp` | Number | no | Maximum retail price for discount display |
| `stock` | Number | yes | Available quantity; min 0 |
| `images` | [{ url, alt }] | no | Variant-specific images |
| `isActive` | Boolean | no | Default true; false hides variant |
| `taxCode` / `taxId` | String / ObjectId | no | Override product-level tax for this variant if needed |

**Note:** If variants are moved to a separate collection later (Option B), same fields with `productId` (ref Product) and unique index on `sku`.

### Tax linkage

Product (or variant) stores `taxCode` (string) or `taxId` (ref tax_rules). At order creation, Server resolves tax per line from this and optionally shipping region. See [tax.md](tax.md).

### Similar products

Similar products are stored in **product_recommendations** collection (not on product document). See [recommendations.md](recommendations.md).

### Indexes

- `seller`, `category`, `categories`, `status`, `slug`, `isDeleted`.
- Optional: text/search index on `name`, `description`, `attributes` for search.

SKU uniqueness for embedded variants must be enforced in Server (e.g. check before save); if using separate `variants` collection, use unique index on `sku`.

See [indexes.md](../indexes.md) for full definitions.
