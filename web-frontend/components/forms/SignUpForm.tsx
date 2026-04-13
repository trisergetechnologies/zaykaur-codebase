'use client';

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaGoogle } from "react-icons/fa6";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/authStore";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser } = useAuthStore();
  const nextPath = searchParams.get("redirect") || searchParams.get("next");
  const safeNextPath =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : null;
  const accountType: "customer" = "customer";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const res = await registerUser(data.name, data.email, data.password, undefined, accountType);
      if (res.success) {
        toast.success("Account created! Welcome aboard.");
        router.push(safeNextPath || "/");
      } else {
        toast.error(res.message || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950">
      {/* LEFT SIDE: Visual/Marketing (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2  bg-pink-600 dark:bg-pink-950/20 items-center justify-center p-12">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-4xl font-bold text-white dark:text-white">
            Join the community of 10M+ Savers
          </h1>
          <p className="text-lg text-black dark:text-white-400">
            Create an account to track orders, manage your wishlist, and get exclusive offers.
          </p>
          {/* You could add an  here */}
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>
            <p className="text-gray-500 mt-2">
              Enter your details to get started
            </p>
          </div>

          <Button 
            variant="outline" 
            className="w-full py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex gap-3 text-base"
          >
            <FaGoogle className="text-red-500" size={20} />
            Continue with Google
          </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-950 px-2 text-gray-500 font-medium">Or register with email</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                {...register("name")}
                id="name"
                placeholder="John Doe"
                className={errors.name ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-pink-500"}
              />
              {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                {...register("email")}
                id="email"
                type="email"
                placeholder="name@example.com"
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-pink-500"}
              />
              {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email.message}</p>}
            </div>

            {/* Password Grid (Side by side on tablet+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  {...register("password")}
                  id="password"
                  type="password"
                  placeholder="••••••"
                  className={errors.password ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-pink-500"}
                />
                {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm</Label>
                <Input
                  {...register("confirmPassword")}
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••"
                  className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-pink-500"}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs font-medium">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white py-6 text-lg font-semibold shadow-lg shadow-pink-200 dark:shadow-none transition-all active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-pink-600 font-semibold hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="text-pink-600 font-semibold hover:underline">Privacy Policy</Link>.
          </p>

          <p className="text-center mt-4 font-medium">
            Already have an account?{" "}
            <Link
              className="text-pink-600 hover:underline"
              href={
                safeNextPath
                  ? `/sign-in?redirect=${encodeURIComponent(safeNextPath)}`
                  : "/sign-in"
              }
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;