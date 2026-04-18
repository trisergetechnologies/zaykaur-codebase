'use client';

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaGoogle } from "react-icons/fa6";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SignInRightColumnSkeleton } from "@/components/auth/SignInRightColumnSkeleton";
import useAuthStore from "@/store/authStore";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuthStore();
  const nextPath =
    searchParams.get("redirect") || searchParams.get("next");
  const safeNextPath =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : null;

  const signUpHref =
    safeNextPath != null
      ? `/sign-up?redirect=${encodeURIComponent(safeNextPath)}${
          safeNextPath.includes("become-supplier") ? "&account=supplier" : ""
        }`
      : "/sign-up";

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(safeNextPath || "/");
    }
  }, [isAuthenticated, router, safeNextPath]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        toast.success("Welcome back!");
        if (safeNextPath) {
          router.push(safeNextPath);
          return;
        }
        const role = (res.data as { user?: { role?: string } })?.user?.role;
        if (role === "admin" || role === "staff" || role === "seller") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      } else {
        toast.error(res.message || "Invalid credentials");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className={cn(isSubmitting && "pointer-events-none select-none")}>
        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h2>
          <p className="text-gray-500 mt-2">Access your shopping dashboard</p>
        </div>

        <Button
          variant="outline"
          className="flex w-full gap-3 border-2 py-6 text-base font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <FaGoogle className="text-red-500" size={20} />
          Sign in with Google
        </Button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200 dark:border-gray-800" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-gray-950 px-4 text-gray-400">Or use your email</span>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs font-semibold text-pink-600 hover:text-pink-700">
                Forgot?
              </Link>
            </div>
            <Input
              {...register("password")}
              id="password"
              type="password"
              placeholder="••••••••"
              className={errors.password ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-pink-500"}
            />
            {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-pink-600 py-6 text-lg font-semibold text-white shadow-md transition-all hover:bg-pink-700 active:scale-[0.98]"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">Don&apos;t have an account?</span>{" "}
          <Link className="font-bold text-pink-600 hover:underline" href={signUpHref}>
            Create Account
          </Link>
        </div>
      </div>

      {isSubmitting ? (
        <div
          className="absolute inset-0 z-10 overflow-auto rounded-xl bg-white/95 p-1 backdrop-blur-sm dark:bg-gray-950/95"
          aria-busy="true"
          aria-live="polite"
          aria-label="Signing in, please wait"
        >
          <SignInRightColumnSkeleton />
        </div>
      ) : null}
    </div>
  );
};

export default SignInForm;
