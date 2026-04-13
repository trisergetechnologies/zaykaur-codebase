"use client";

import { usePathname } from "next/navigation";
import MegaMenuBase from "../megamenu/MegaMenuBase";
import { megaMenuData } from "@/data/menudata/menuData";
import { topCategories } from "@/data/category/topCategories";

export default function MegaMenuNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-6 h-full">

      {topCategories.map((cat) => (
        <MegaMenuBase
          key={cat.slug}
          label={cat.label}
          basePath={cat.slug}
          data={megaMenuData[cat.slug]}
          isActive={pathname === "/shop" && new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("category") === cat.slug}
        />
      ))}

    </nav>
  );
}