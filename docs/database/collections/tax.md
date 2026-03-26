# Tax configuration

Tax is configured in `tax_rules`. Products (or variants) reference a tax rule by `taxCode` or `taxId`. **All tax calculation is done on the Server at order creation;** no client-side tax logic.

## Collection: tax_rules

Stores tax rates and applicability. Server resolves which rule applies per line item (product/variant + optional region) and computes `taxAmount`; order stores the result in the snapshot.

### Schema

| Field | Type | Required | Index | Use |
|-------|------|----------|-------|-----|
| `code` | String | yes | yes | e.g. GST_12, VAT_5; used by product.taxCode |
| `name` | String | yes | — | Display name |
| `rate` | Number | yes | — | Percentage (e.g. 12 for 12%) |
| `type` | String | yes | — | `gst` \| `vat` \| `igst` \| `other` |
| `region` | String | no | — | State/country code for region-based tax; null = applicable everywhere |
| `categoryIds` | [ObjectId] | no | — | If set, rule applies to products in these categories (when product has no taxCode) |
| `productIds` | [ObjectId] | no | — | If set, product-specific override |
| `effectiveFrom` | Date | no | yes | Rule valid from this date |
| `effectiveTo` | Date | no | yes | Rule valid until this date; null = no end |
| `priority` | Number | no | — | Higher = preferred when multiple rules match; resolve by priority in Server |
| `isActive` | Boolean | no | yes | Default true |
| `createdAt` | Date | auto | — | |
| `updatedAt` | Date | auto | — | |

### Rule resolution order (Server logic)

1. **Product/variant level:** If product or variant has `taxCode` or `taxId`, use that rule (if active and within effective dates).
2. **Category level:** Else if rule has `categoryIds` and product’s category (or ancestors) is in list, use by priority.
3. **Region:** If rules are region-specific, filter by shipping address state/country.
4. **Default:** Single default rule (e.g. no region, lowest priority or explicit default flag) when nothing else matches.

Document the exact resolution order and rounding policy in Server; this doc describes the data model.

### Formula and rounding

- Line tax: `taxAmount = round(unitPrice * quantity * rate / 100)` or round per unit then sum; define policy in Server (e.g. round half-up, currency decimal places).
- Order stores `taxRate` and `taxAmount` per line; no recomputation after order creation.

### Usage in orders

Order line item snapshot includes:

- `taxRate` — percentage applied (from resolved rule).
- `taxAmount` — computed amount for this line.

Totals: `taxTotal` = sum of line `taxAmount`; `grandTotal` = subtotal + taxTotal + shipping - discount.

See [orders.md](orders.md) for full order schema.
