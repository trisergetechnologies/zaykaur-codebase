import express from "express";
import { loginCustomer, registerCustomer, registerSeller, forgotPassword, resetPassword, verifyEmail } from "../../controllers/auth/auth.controller.js";
import validate from "../../middlewares/validate.js";
import rateLimitAuth from "../../middlewares/rateLimitAuth.js";
import { registerSchema, registerSellerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../../validators/authSchemas.js";

const router = express.Router();

router.post("/register", rateLimitAuth, validate(registerSchema), registerCustomer);
router.post("/seller/register", rateLimitAuth, validate(registerSellerSchema), registerSeller);
router.post("/login", rateLimitAuth, validate(loginSchema), loginCustomer);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);
router.get("/verify-email/:token", verifyEmail);

export default router;
