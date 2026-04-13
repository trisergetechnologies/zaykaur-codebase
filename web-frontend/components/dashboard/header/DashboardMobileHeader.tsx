"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Home, ClipboardList, Box, Layers, Users, Store, Ticket, RotateCcw, BarChart3, Package, Truck } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/authStore";

interface NavLink { link: string; label: string; icon: React.ReactNode; }

const adminLinks: NavLink[] = [
  { link: "/dashboard", label: "Home", icon: <Home size={20} /> },
  { link: "/dashboard/orders", label: "Orders", icon: <ClipboardList size={20} /> },
  { link: "/dashboard/products", label: "Products", icon: <Box size={20} /> },
  { link: "/dashboard/categories", label: "Categories", icon: <Layers size={20} /> },
  { link: "/dashboard/sellers", label: "Sellers", icon: <Store size={20} /> },
  { link: "/dashboard/coupons", label: "Coupons", icon: <Ticket size={20} /> },
  { link: "/dashboard/returns", label: "Returns", icon: <RotateCcw size={20} /> },
  { link: "/dashboard/reports", label: "Reports", icon: <BarChart3 size={20} /> },
  { link: "/dashboard/customers", label: "Customers", icon: <Users size={20} /> },
];

const sellerLinks: NavLink[] = [
  { link: "/dashboard", label: "Home", icon: <Home size={20} /> },
  { link: "/dashboard/products", label: "My Products", icon: <Box size={20} /> },
  { link: "/dashboard/inventory", label: "Inventory", icon: <Package size={20} /> },
  { link: "/dashboard/orders", label: "Orders", icon: <ClipboardList size={20} /> },
  { link: "/dashboard/shipments", label: "Shipments", icon: <Truck size={20} /> },
  { link: "/dashboard/returns", label: "Returns", icon: <RotateCcw size={20} /> },
  { link: "/dashboard/reports", label: "Reports", icon: <BarChart3 size={20} /> },
];

const DashboardMobileHeader = () => {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "admin";
  const links = role === "seller" ? sellerLinks : adminLinks;

  const isActive = (link: string) =>
    link === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link);

  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger>
          <Menu />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Dashboard</SheetTitle>
            <SheetDescription asChild>
              <ul className="flex flex-col gap-2 items-start justify-center mt-4">
                {links.map((item) => (
                  <li key={item.label} className="w-full">
                    <Link
                      href={item.link}
                      className={cn(
                        "flex items-center text-lg w-full gap-2 p-2 rounded-md transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-800",
                        isActive(item.link) && "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default DashboardMobileHeader;
