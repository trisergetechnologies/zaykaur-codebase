import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  accountType: z.enum(["customer", "seller"]).optional(),
  /** Explicit flag from supplier signup flow (redundant with accountType but harder to lose). */
  sellerRegistration: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});
