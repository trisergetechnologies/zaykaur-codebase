# Orders

Orders are **immutable**. All amounts, addresses, and line item details are stored as snapshots at order creation and never updated (except order/shipment status and payment status).

## Collection: orders

### Schema

| Field | Type | Required | Index | Use |
|-------|------|----------|-------|-----|
| `userId` | ObjectId | yes | yes | ref User (buyer) |
| `orderNumber` | String | yes | unique | Human-readable; e.g. ZK-YYYYMMDD-XXXX |
| `shippingAddress` | Address | yes | — | Snapshot; same shape as user address |
| `billingAddress` | Address | no | — | Snapshot; optional |
| `items` | [OrderItem] | yes | — | Embedded; full snapshot per line |
| `subtotal` | Number | yes | — | Sum of line totals before tax |
| `taxTotal` | Number | yes | — | Sum of line taxAmount |
| `shippingAmount` | Number | yes | — | Delivery charge |
| `discountTotal` | Number | no | — | Cart-level coupon etc.; default 0 |
| `grandTotal` | Number | yes | — | subtotal + taxTotal + shippingAmount - discountTotal |
| `currency` | String | no | — | Default INR |
| `paymentMethod` | String | yes | — | `cod` \| `online` \| `wallet` \| etc. |
| `paymentStatus` | String | yes | yes | `pending` \| `paid` \| `failed` \| `refunded`; default pending |
| `paymentId` | String | no | — | Gateway reference |
| `paidAt` | Date | no | — | When payment confirmed |
| `orderStatus` | String | yes | yes | See enum below; default placed |
| `shipments` | [Shipment] | no | — | Embedded; see order-tracking-delivery.md |
| `confirmedAt` | Date | no | — | Reporting |
| `shippedAt` | Date | no | — | Reporting |
| `deliveredAt` | Date | no | — | Reporting |
| `createdAt` | Date | auto | yes | |
| `updatedAt` | Date | auto | — | |

### Order status enum

`placed` | `confirmed` | `packed` | `shipped` | `in_transit` | `out_for_delivery` | `delivered` | `returned` | `cancelled`

Single status per order for overall state; per-shipment status in `shipments[]` for split orders.

### Embedded address shape (shippingAddress, billingAddress)

| Field | Type |
|-------|------|
| fullName | String |
| phone | String |
| street | String |
| city | String |
| state | String |
| postalCode | String |
| country | String |

No ref to user address; copy from user at checkout so order is independent.

### Embedded order item shape (items[])

Full snapshot; do not update after creation.

| Field | Type | Use |
|-------|------|-----|
| productId | ObjectId | ref Product (for link to listing; product may later be soft-deleted) |
| variantId | ObjectId | ref variant _id if variant product |
| name | String | Product/variant name at order time |
| sku | String | SKU at order time |
| quantity | Number | Ordered qty |
| unitPrice | Number | Price per unit at order time |
| taxRate | Number | Percentage applied |
| taxAmount | Number | Tax for this line |
| lineTotal | Number | (unitPrice * quantity) + taxAmount or as defined |
| sellerId | ObjectId | ref User (seller) |
| productSnapshot | { name, slug, image } | Optional; for display without loading product |

All monetary values fixed at order creation. Server computes from cart + current product/variant + tax rules; client only sends cart and address.

### Indexes

- `userId`, `orderNumber` (unique), `orderStatus`, `createdAt`, `paymentStatus`.
- Compound for seller reports: e.g. `items.sellerId` + `createdAt` (multikey on items.sellerId).

See [indexes.md](../indexes.md) and [order-tracking-delivery.md](order-tracking-delivery.md) for shipments.
