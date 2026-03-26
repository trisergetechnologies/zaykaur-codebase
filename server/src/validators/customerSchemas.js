import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).default(1),
});

export const createOrderSchema = z.object({
  addressIndex: z.number().int().min(0).optional(),
  paymentMethod: z.enum(["cod", "online", "wallet"], {
    required_error: "Payment method is required",
  }),
});

export const addAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Phone is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(5, "Postal code is required"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = addAddressSchema.partial();

export const applyCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
});
