"use client";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isAuthLoading, isAuthenticated, user, sellerAccess } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || "http://localhost:3000";
  const allowedWhenUnapproved = ["/seller/onboarding", "/seller/profile"];
  const isAllowedRoute = allowedWhenUnapproved.some((route) => pathname.startsWith(route));
  const sellerLocked = user?.role === "seller" && !sellerAccess?.isApproved;

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/signin");
      return;
    }
    if (!isAuthLoading && isAuthenticated && user?.role === "customer") {
      window.location.href = webAppUrl;
      return;
    }
    if (!isAuthLoading && isAuthenticated && user?.role === "admin") {
      router.push("/admin");
    }
    if (!isAuthLoading && sellerLocked && !isAllowedRoute) {
      router.replace("/seller/onboarding");
    }
  }, [isAuthLoading, isAuthenticated, user?.role, router, webAppUrl, sellerLocked, isAllowedRoute]);

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="mx-auto max-w-(--breakpoint-2xl) p-4 pb-10 md:p-6">
          {sellerLocked && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-sm font-semibold">Seller account approval pending</p>
                  <p className="text-sm">
                    Complete onboarding and wait for admin approval before using orders, products, inventory, shipments, returns, and reports.
                  </p>
                </div>
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

