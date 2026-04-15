"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function BecomeSupplierPage() {
  const { isAuthLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.replace("/signup");
      return;
    }
    if (user?.role === "seller") {
      router.replace("/seller/onboarding");
      return;
    }
    router.replace("/signin");
  }, [isAuthLoading, isAuthenticated, user?.role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
      Redirecting to seller onboarding...
    </div>
  );
}

