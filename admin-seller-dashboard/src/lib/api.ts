/**
 * Zaykaur backend API base URL (no trailing slash, no /api suffix).
 * Set NEXT_PUBLIC_API_URL to the API origin only, e.g. http://localhost:5000 or http://localhost:4000 (gateway).
 * If unset, requests use same-origin `/api/...` and Next.js rewrites proxy them (see next.config.ts).
 */
export const getApiBase = (): string => {
  if (typeof window === "undefined") return "";
  let url = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");
  // Avoid double /api when paths already start with /api/v1/...
  url = url.replace(/\/api\/v1\/?$/i, "").replace(/\/api\/?$/i, "");
  return url;
};

export const apiUrl = (path: string): string => {
  const base = getApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};
