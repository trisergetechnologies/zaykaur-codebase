"use client";

import React from "react";
import Link from "next/link";
import {
  Grid as GridIcon,
  Box as BoxIcon,
  Layers,
  Store,
  ShoppingBasketIcon,
  Ticket,
  RotateCcw,
  BarChart3,
  UserCircleIcon,
} from "lucide-react";

const menu = [
  { icon: <GridIcon className="w-6 h-6" />, name: "Dashboard", path: "/admin" },
  { icon: <BoxIcon className="w-6 h-6" />, name: "Products", path: "/admin/product" },
  { icon: <Layers className="w-6 h-6" />, name: "Categories", path: "/admin/categories" },
  { icon: <Store className="w-6 h-6" />, name: "Sellers", path: "/admin/sellers" },
  { icon: <ShoppingBasketIcon className="w-6 h-6" />, name: "Orders", path: "/admin/orders" },
  { icon: <Ticket className="w-6 h-6" />, name: "Coupons", path: "/admin/coupons" },
  { icon: <RotateCcw className="w-6 h-6" />, name: "Returns", path: "/admin/returns" },
  { icon: <BarChart3 className="w-6 h-6" />, name: "Reports", path: "/admin/reports" },
  { icon: <UserCircleIcon className="w-6 h-6" />, name: "Customers", path: "/admin/customers" },
];

export default function AdminWelcome() {
  return (
    <div className="relative min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black" />
      <div className="absolute inset-0 bg-grid-slate-200/40 dark:bg-grid-slate-700/20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="relative w-full max-w-6xl space-y-12 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white drop-shadow-sm">
            Welcome to Zaykaur Dashboard
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage products, orders, sellers, coupons, returns, and reports in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="group p-6 rounded-2xl shadow-lg bg-white/70 dark:bg-gray-900/70 
              backdrop-blur-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center 
              justify-center hover:-translate-y-1 hover:shadow-xl transition"
            >
              <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition">
                {item.icon}
              </div>
              <h3 className="mt-4 font-semibold text-gray-800 dark:text-white">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 opacity-90">
                Go to {item.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

