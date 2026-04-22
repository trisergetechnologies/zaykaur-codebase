/** Seller dashboard base URL (no trailing slash). */
export function getSellerPortalBase(): string {
  return (
    process.env.NEXT_PUBLIC_SELLER_PORTAL_URL || "https://seller.zaykaur.com"
  ).replace(/\/+$/, "");
}

export function getSellerSignInUrl(): string {
  return `${getSellerPortalBase()}/sign-in`;
}
