"use client";

import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiUrl } from "@/lib/api";

export default function SignInForm() {
  const [isSellerSignupMode, setIsSellerSignupMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    if (isSellerSignupMode && !name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (isSellerSignupMode && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = isSellerSignupMode
        ? await axios.post(apiUrl("/api/v1/auth/seller/register"), {
            name: name.trim(),
            email,
            phone: phone.trim() || undefined,
            password,
          })
        : await axios.post(apiUrl("/api/v1/auth/login"), {
            email,
            password,
          });

      const data = res.data?.data;
      if (res.data?.success && data?.token) {
        const user = data.user
          ? {
              _id: data.user.id || data.user._id,
              id: data.user.id || data.user._id,
              name: data.user.name ?? "",
              email: data.user.email ?? "",
              role: data.user.role ?? "customer",
            }
          : null;
        await login(data.token, user);

        if (user?.role === "customer") {
          toast.success("Redirecting to store...");
          window.location.href = webAppUrl;
          return;
        }

        toast.success(
          isSellerSignupMode
            ? "Seller account created! Redirecting..."
            : "Login successful! Redirecting..."
        );
        setTimeout(() => {
          if (user?.role === "seller") {
            axios
              .get(apiUrl("/api/v1/seller/onboarding/me"), {
                headers: { Authorization: `Bearer ${data.token}` },
              })
              .then((onboardingRes) => {
                const profile = onboardingRes.data?.data;
                const isApproved =
                  profile?.onboardingStatus === "approved" &&
                  Boolean(profile?.isVerified) &&
                  Boolean(profile?.isActive);
                router.push(isApproved ? "/seller/orders" : "/seller/onboarding");
              })
              .catch(() => {
                router.push("/seller/onboarding");
              });
            return;
          }
          router.push("/admin");
        }, 500);
      } else {
        toast.error(res.data?.message || "Login failed");
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message || "Something went wrong. Try again."
        : "Something went wrong. Try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:flex-col lg:justify-center lg:items-center lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-12 relative overflow-hidden">
        <div className="relative z-10 space-y-6 text-center">
          <h1
            onClick={() => router.push("/")}
            className="text-5xl font-extrabold tracking-tight cursor-pointer"
          >
            Zaykaur
          </h1>
          <p className="text-lg max-w-md mx-auto text-white/80">
            Admin & Seller Dashboard. Manage products, orders, sellers, and
            reports in one place.
          </p>
        </div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 py-12 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 space-y-6 animate-fadeIn">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isSellerSignupMode ? "Create Seller Account" : "Welcome Back"}
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {isSellerSignupMode
                ? "Create your seller account to start onboarding"
                : "Sign in to Zaykaur dashboard"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSellerSignupMode && (
              <>
                <div>
                  <Label>Full Name</Label>
                  <Input
                    type="text"
                    placeholder="Seller name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    type="text"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </>
            )}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="seller@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeIcon className="w-5 h-5" />
                  ) : (
                    <EyeCloseIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {isSellerSignupMode && (
              <div>
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeIcon className="w-5 h-5" />
                    ) : (
                      <EyeCloseIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                size="md"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg transition transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  isSellerSignupMode ? "Create Seller Account" : "Sign In"
                )}
              </Button>
            </div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              {isSellerSignupMode ? "Already have account? " : "New seller? "}
              <button
                type="button"
                onClick={() => setIsSellerSignupMode((prev) => !prev)}
                className="font-semibold text-indigo-600 hover:underline"
              >
                {isSellerSignupMode ? "Sign in here" : "Create seller account"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
    </div>
  );
}
