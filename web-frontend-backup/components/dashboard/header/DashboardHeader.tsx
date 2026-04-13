"use client";

import Logo from "@/components/logo/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import React from "react";
import Notification from "../notificaton/Notification";
import DashboardMobileHeader from "./DashboardMobileHeader";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";

const DashboardHeader = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/sign-in");
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow sticky top-0 left-0 right-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          {user && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200 uppercase">
              {user.role}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
              {user.name}
            </span>
          )}
          <ThemeToggle />
          <Notification />
          <Button
            size="sm"
            variant="destructive"
            className="flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut size={16} /> Exit
          </Button>
          <DashboardMobileHeader />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
