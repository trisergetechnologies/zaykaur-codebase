"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, fetchProfile } = useAuthStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!isAuthenticated) {
        router.replace("/sign-in");
        return;
      }
      await fetchProfile();
      setChecked(true);
    };
    check();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!checked) return;
    if (!isAuthenticated || !user) {
      router.replace("/sign-in");
      return;
    }
    if (user.role === "customer") {
      router.replace("/");
      return;
    }
  }, [checked, isAuthenticated, user]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !["admin", "staff", "seller"].includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
