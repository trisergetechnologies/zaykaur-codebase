"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface MenuColumn {
  columnTitle: string;
  items: string[];
}

interface Props {
  label: string;
  basePath: string;
  data: MenuColumn[];
  isActive?: boolean;
}

export default function MegaMenuBase({
  label,
  basePath,
  data,
  isActive,
}: Props) {
  return (
    <div className="group h-full flex items-center">

      {/* NAV ITEM */}
      <Link
        href={`/shop?category=${basePath}`}
        className={cn(
          "px-3 py-2 text-sm font-semibold transition-colors",
          isActive
            ? "text-pink-600"
            : "text-gray-800 hover:text-pink-600"
        )}
      >
        {label}
      </Link>

      {/* MEGA MENU */}
      <div
        className="
          absolute left-1/2 top-full
          -translate-x-1/2
          w-[calc(100vw-2rem)] max-w-[1100px]
          bg-white border shadow-xl rounded-b-lg
          opacity-0 invisible translate-y-3
          group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
          transition-all duration-200
          z-50 overflow-x-auto
        "
      >
        <div className="p-6 lg:p-8">

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-6">

           {(data ?? []).map((col)=> (
              <div key={col.columnTitle}>

                {/* COLUMN TITLE */}
                <h4 className="text-sm font-semibold text-pink-600 mb-3">
                  {col.columnTitle}
                </h4>

                {/* ITEMS */}
                <ul className="space-y-2">

                  {col.items.map((item) => (
                    <li key={item}>
                      <Link
                        href={`/shop?category=${slugify(item)}`}
                        className="
                          text-sm text-gray-700
                          hover:text-black
                          transition
                        "
                      >
                        {item}
                      </Link>
                    </li>
                  ))}

                </ul>

              </div>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}