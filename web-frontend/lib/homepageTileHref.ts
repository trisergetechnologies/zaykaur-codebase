import type { HomepageBestDealTile, HomepageTrendingTile } from "@/types/homepage";
import { normalizeStoreHref } from "@/lib/normalizeStoreHref";

function hasCuratedProducts(
  tile: Pick<HomepageBestDealTile | HomepageTrendingTile, "curatedSlug" | "productIds">
): boolean {
  const slug = (tile.curatedSlug || "").trim();
  const n = tile.productIds?.length ?? 0;
  return Boolean(slug && n > 0);
}

export function bestDealTileHref(tile: HomepageBestDealTile): string {
  if (hasCuratedProducts(tile)) {
    return `/curated/${encodeURIComponent((tile.curatedSlug || "").trim())}`;
  }
  return normalizeStoreHref(tile.link);
}

export function trendingTileHref(tile: HomepageTrendingTile): string {
  if (hasCuratedProducts(tile)) {
    return `/curated/${encodeURIComponent((tile.curatedSlug || "").trim())}`;
  }
  return normalizeStoreHref(tile.link || "");
}
