# ZayKaur Documentation

Documentation index for the ZayKaur marketplace platform.

## Overview

- **Architecture:** Single public entry point (API Gateway); Server and Python recommendation service are internal. All clients (Web, Mobile, Dashboard) talk only to the Gateway.
- **Database:** MongoDB (NoSQL). All access is via Server only; no direct DB access from clients or Gateway.

## Documentation Index

| Section | Description |
|--------|-------------|
| [Architecture](architecture/README.md) | Gateway, Server, Redis, single entry point, no cascade failures |
| [API Gateway](api-gateway/README.md) | Proxy, cache, rate limit, env |
| [Setup](setup/README.md) | Env vars, seed, run Gateway / Server / Frontend locally and on Cloud Run |
| [Database](database/README.md) | Database design, collections, indexes, and data integrity |
| [Frontend](frontend/README.md) | Auth, API integration, env |

## Database

- [Database overview](database/README.md) — Principles, collections list, glossary
- [Collections](database/collections/) — Schema and usage per collection
  - [Users](database/collections/users.md)
  - [Categories](database/collections/categories.md)
  - [Products](database/collections/products.md)
  - [Tax](database/collections/tax.md)
  - [Orders](database/collections/orders.md)
  - [Order tracking & delivery](database/collections/order-tracking-delivery.md)
  - [Cart & wishlist](database/collections/cart-wishlist.md)
  - [Recommendations](database/collections/recommendations.md)
- [Indexes](database/indexes.md) — All indexes with rationale
- [Data integrity](database/data-integrity.md) — No data loss, immutability, soft deletes, idempotency

## Principles

1. **No data loss** — Orders are immutable; snapshots for addresses and line items.
2. **Single public entry point** — All traffic via API Gateway.
3. **No business logic at client** — Tax, validation, and state transitions live in Server.
4. **Every field has a use** — All documented; no redundant or placeholder fields.
