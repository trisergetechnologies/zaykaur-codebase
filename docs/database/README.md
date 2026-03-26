# ZayKaur Database Overview

MongoDB is the primary database. All access happens **via the Server only**. The API Gateway and clients do not connect to the database.

## Design principles

- **No data loss:** Immutable order snapshots; soft deletes for catalog and users.
- **Single source of truth:** One database; Server is the only service that reads/writes.
- **Every field used:** Each collection and field has a defined purpose; documented in this folder.

## Collections

| Collection | Purpose |
|------------|--------|
| `users` | Buyers (customers), sellers, admin, staff — identity, role, profile, embedded addresses |
| `seller_profiles` | Seller-specific: shop, legal, settlement, delivery defaults |
| `categories` | Category tree (parent, ancestors, level) for navigation and product classification |
| `products` | Product catalog with embedded variants; seller, category, tax linkage |
| `tax_rules` | Tax configuration (code, rate, applicability); used at order creation |
| `orders` | Immutable orders with snapshot items, addresses, totals, payments, embedded shipments |
| `delivery_providers` | Third-party carriers (code, integration flag, config reference); manual fallback when not integrated |
| `carts` | One cart per user; items reference product/variant/seller |
| `wishlists` | User wishlist items (product/variant) for analytics and scale |
| `product_recommendations` | Similar products (manual or AI); used for "similar products" and recommendations |
| `idempotency_keys` | Optional; idempotency keys for payment and delivery webhooks |

## Glossary

- **Snapshot:** Copy of data at a point in time stored on the order (e.g. address, line item name/price). Never updated after order creation.
- **Soft delete:** `isDeleted: true` and `deletedAt` set; document retained. Reads filter `isDeleted: false` unless admin "show deleted".
- **Materialized path:** `ancestors` array on categories for fast "all descendants" and breadcrumb queries.
- **Variant:** One sellable unit of a product (e.g. size M, color Red) with its own SKU, price, stock.
- **Shipment:** One dispatch within an order (e.g. one seller’s items); can have its own carrier, AWB, and tracking events.

## Connection

- Server connects using `MONGO_URI` (see Server env config).
- No other service should have `MONGO_URI` or direct DB access in production.

## Migration

For existing databases created before this design, run the one-time migration from the `server` directory:

```bash
cd server && npm run migrate
```

This backfills categories (parent, ancestors, level, displayOrder), products (variants from legacy root-level price/stock/sku), orders (field renames and item snapshot shape), and carts (field renames). See `server/scripts/migrate-db-design.js`.
