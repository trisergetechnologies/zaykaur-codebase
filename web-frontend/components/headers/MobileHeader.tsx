"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Heart,
  HelpCircle,
  Home,
  ListOrdered,
  LogOut,
  Menu,
  Store,
  Text,
  User,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const MobileHeader = () => {
  const pathname = usePathname();

  const navlinks = [
    {
      link: "/",
      label: "Home",
      icon: <Home size={20} />,
      isActive: pathname === "/",
    },
    {
      link: "/shop",
      label: "Shop",
      icon: <Store size={20} />,
      isActive: pathname.includes("/shop"),
    },
    {
      link: "/blog",
      label: "Blogs",
      icon: <Text size={20} />,
      isActive: pathname.includes("/blog"),
    },
  ];

  const userLinks = [
    {
      link: "/my-account",
      label: "My Account",
      icon: <User size={20} />,
      isActive: pathname.includes("/my-account"),
    },
    {
      link: "/wishlist",
      label: "Wishlist",
      icon: <Heart size={20} />,
      isActive: pathname.includes("/wishlist"),
    },
    {
      link: "/my-orders",
      label: "My Orders",
      icon: <ListOrdered size={20} />,
      isActive: pathname.includes("/my-orders"),
    },
    {
      link: "/help",
      label: "Help",
      icon: <HelpCircle size={20} />,
      isActive: pathname.includes("/help"),
    },
  ];

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2">
            <Menu size={26} />
          </button>
        </SheetTrigger>

        <SheetContent side="left" className="w-[85%] max-w-[320px] p-6">
          <div className="space-y-6">

            {/* Main Navigation */}
            <div className="space-y-2">
              {navlinks.map((link) => (
                <Link
                  key={link.link}
                  href={link.link}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md transition hover:bg-gray-100 dark:hover:bg-gray-800",
                    link.isActive && "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            <Separator />

            {/* User Links */}
            <div className="space-y-2">
              {userLinks.map((link) => (
                <Link
                  key={link.link}
                  href={link.link}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md transition hover:bg-gray-100 dark:hover:bg-gray-800",
                    link.isActive && "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>

            <Separator />

            {/* Logout */}
            <button className="flex items-center gap-3 p-2 text-red-600 hover:opacity-70 transition">
              <LogOut size={20} />
              Logout
            </button>

          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileHeader;