/**
 * Discount in currency (₹) from merchandise subtotal (pre-tax, pre-shipping).
 */
export function discountFromCoupon(coupon, merchandiseSubtotal) {
  if (!coupon || merchandiseSubtotal <= 0) return 0;
  const cartTotal = merchandiseSubtotal;
  if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) return 0;
  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.round(cartTotal * (coupon.value / 100));
    if (coupon.maxDiscount != null && coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = Math.min(coupon.value, cartTotal);
  }
  return Math.max(0, Math.min(discount, cartTotal));
}
