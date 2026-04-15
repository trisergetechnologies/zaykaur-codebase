/** Ensures internal links work with Next.js Link (leading slash, except absolute URLs). */
export function normalizeStoreHref(href: string): string {
  const h = (href || "").trim();
  if (!h) return "/shop";
  if (/^https?:\/\//i.test(h)) return h;
  if (h.startsWith("/")) return h;
  return `/${h}`;
}
