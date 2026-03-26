# Categories and subcategories

Single collection `categories` with a tree structure using `parent` and materialized path `ancestors`.

## Collection: categories

Used for navigation (megamenu, breadcrumbs), product classification, and filtering. Products link to a primary category and optionally multiple categories.

### Schema

| Field | Type | Required | Index | Use |
|-------|------|----------|-------|-----|
| `parent` | ObjectId | no | yes | ref Category; null for root |
| `ancestors` | [ObjectId] | no | yes | Materialized path: [rootId, parentId, ...]; empty for root |
| `name` | String | yes | — | Display name; max 80 chars |
| `slug` | String | yes | unique | URL-safe; unique across collection |
| `description` | String | no | — | Optional category description |
| `image` | String | no | — | Category image URL |
| `displayOrder` | Number | no | yes | Sort order among siblings; lower first |
| `level` | Number | no | yes | 0 = root, 1 = first level, etc.; updated on write |
| `metaTitle` | String | no | — | SEO |
| `metaDescription` | String | no | — | SEO |
| `variantAttributeTemplates` | Array | no | — | Suggested variant attributes for products in this category (e.g. Electronics: RAM, Storage; Clothing: Size, Color). Sellers use when creating products. |
| `isActive` | Boolean | no | yes | Default true |
| `isDeleted` | Boolean | no | — | Soft delete; default false |
| `deletedAt` | Date | no | — | Set when soft-deleted |
| `createdAt` | Date | auto | — | |
| `updatedAt` | Date | auto | — | |

### Tree rules

- **parent:** Null for root categories; otherwise must reference an existing category. Server must prevent circular references (e.g. A → B → A).
- **ancestors:** Array of category IDs from root to immediate parent. Example: root (ancestors: []), child (ancestors: [rootId]), grandchild (ancestors: [rootId, childId]). Updated by Server whenever `parent` is set.
- **level:** 0 for root; 1 for direct children of root; etc. Updated by Server from `ancestors.length`.

### Usage

- **Listing children:** Query `{ parent: categoryId, isActive: true, isDeleted: false }` sort by `displayOrder`.
- **Breadcrumb:** Use `ancestors` to fetch parent chain (or embed names in ancestors if needed).
- **All descendants:** Query `{ ancestors: categoryId }` to get all categories under a node.
- **Product assignment:** Product has `category` (primary) and optionally `categories[]` (multiple). Filters can use `ancestors` to include products in subcategories (e.g. "all under Electronics").

### Indexes

- `parent` — list children.
- `ancestors` — list descendants, breadcrumb.
- `slug` (unique) — resolve by URL.
- `{ isActive: 1, level: 1, displayOrder: 1 }` — listing by level and order.

See [indexes.md](../indexes.md) for full definitions.
