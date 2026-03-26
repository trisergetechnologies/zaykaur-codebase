# Recommendations / similar products

Similar products and personalized recommendations are stored in a dedicated collection so AI (Python service) and manual curation can update them without touching product documents.

## Collection: product_recommendations

Stores "product A is related to product B" with source and optional score/order.

### Schema

| Field | Type | Required | Index | Use |
|-------|------|----------|-------|-----|
| productId | ObjectId | yes | yes | ref Product (the source product) |
| recommendedProductId | ObjectId | yes | yes | ref Product (the recommended product) |
| source | String | yes | yes | `manual` \| `ai` |
| score | Number | no | — | Relevance score (e.g. 0–1); for AI |
| sortOrder | Number | no | — | Display order; lower first |
| createdAt | Date | auto | — | |

### Usage

- **Similar products (PDP):** Query `{ productId: currentProductId }` sort by `sortOrder` or `score`; return list of `recommendedProductId`. Optionally filter by `source` (e.g. show manual first, then AI).
- **AI updates:** Python recommendation service writes/updates documents with `source: 'ai'` and optional `score`. Can replace all AI recs for a product by deleting old `source: 'ai'` rows and inserting new ones.
- **Manual curation:** Admin/seller adds rows with `source: 'manual'` and `sortOrder` for "similar products" widget.
- **Caching:** Server or Gateway can cache resolved list in Redis (e.g. key `recommendations:product:{id}`) with short TTL.

### Indexes

- `productId` — fetch all recommendations for a product.
- `(productId, source)` — fetch by source (e.g. only manual or only AI).
- Optional: unique on `(productId, recommendedProductId, source)` to avoid duplicates per source.

See [indexes.md](../indexes.md) for full definitions.
