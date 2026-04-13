/** 24-char hex MongoDB ObjectId string (public API routes expect this for :productId). */
export function isMongoObjectId(value: string | number | undefined | null): boolean {
  if (value == null) return false;
  return /^[a-fA-F0-9]{24}$/.test(String(value).trim());
}
