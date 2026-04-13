"use client";
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Heart, HelpCircle, LayoutDashboard, ListOrdered, LogOut, User, LogIn } from "lucide-react";
import Link from "next/link";
import { Separator } from "../ui/separator";
import UserAvatar from "./UserAvatar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/authStore";
import { toast } from "sonner";

const AccountPopover = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const showDashboard = user?.role === "admin" || user?.role === "staff" || user?.role === "seller";

  const userLinks = [
    {
      link: "/my-account",
      label: "My Account",
      icon: <User />,
      isActive: pathname.includes("/my-account"),
    },
    {
      link: "/wishlist",
      label: "Wishlist",
      icon: <Heart />,
      isActive: pathname.includes("/wishlist"),
    },
    {
      link: "/my-orders",
      label: "My Orders",
      icon: <ListOrdered />,
      isActive: pathname.includes("/my-orders"),
    },
    {
      link: "/help",
      label: "Help",
      icon: <HelpCircle />,
      isActive: pathname.includes("/help"),
    },
  ];

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div className="hidden lg:block">
      <Popover>
        <PopoverTrigger className="flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 duration-200 p-2 rounded-md">
          <User size={25}  />
        </PopoverTrigger>
        <PopoverContent
          className=" rounded-2xl 
      "
        >
          <ul className="space-y-1 text-center ">
            <UserAvatar />
            <Separator className="!my-2" />
            {isAuthenticated ? (
              <>
                {showDashboard && (
                  <Link
                    href="/dashboard"
                    className={cn(
                      "flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-md",
                      pathname.startsWith("/dashboard") && "bg-gray-200 dark:bg-gray-800"
                    )}
                  >
                    <LayoutDashboard /> Dashboard
                  </Link>
                )}
                {userLinks.map((link) => (
                  <Link
                    key={link.link}
                    href={link.link}
                    className={cn(
                      "flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-md",
                      link.isActive && "bg-gray-200  dark:bg-gray-800"
                    )}
                  >
                    {link.icon} {link.label}
                  </Link>
                ))}
                <Separator className="!my-2" />
                <button
                  onClick={handleLogout}
                  className="flex items-start justify-start gap-2 p-2 bg-transparent hover:opacity-50 w-full"
                >
                  <LogOut />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/sign-in"
                className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-md text-pink-600 font-medium"
              >
                <LogIn /> Login / Register
              </Link>
            )}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AccountPopover;
