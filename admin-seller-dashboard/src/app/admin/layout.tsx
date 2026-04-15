"use client";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isAuthLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || "http://localhost:3000";

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/signin");
      return;
    }
    if (isAuthenticated && user?.role === "seller") {
      router.replace("/seller/orders");
      return;
    }
    if (isAuthenticated && user?.role === "customer") {
      window.location.href = webAppUrl;
    }
  }, [isAuthLoading, isAuthenticated, user?.role, router, webAppUrl]);

  // Sidebar margin logic
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  // Show loading spinner while auth is being checked
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don’t render layout until auth state is confirmed
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        {/* Header */}
        <AppHeader />

        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <div className="premium-surface rounded-3xl p-4 md:p-5">
          {children}
          </div>
        </div>
      </div>
    </div>
  );
}
