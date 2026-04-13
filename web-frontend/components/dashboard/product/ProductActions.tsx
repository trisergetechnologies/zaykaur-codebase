"use client";

import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface ProductActionsProps {
  productId?: string;
}

const ProductActions = ({ productId }: ProductActionsProps) => {
  return (
    <div>
      <Popover>
        <PopoverTrigger>
          <div className="flex items-center justify-center hover:bg-slate-200 p-2 rounded-full dark:hover:bg-slate-900 duration-200">
            <MoreHorizontal />
          </div>
        </PopoverTrigger>
        <PopoverContent className="text-start">
          <Link
            href={`/dashboard/products/${productId || ""}`}
            className="py-2 px-4 rounded-md w-full block hover:bg-slate-200 dark:hover:bg-slate-900"
          >
            View Product
          </Link>
          <Link
            href={`/dashboard/products/${productId || ""}?edit=true`}
            className="py-2 px-4 rounded-md w-full block hover:bg-slate-200 dark:hover:bg-slate-900"
          >
            Edit Product
          </Link>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ProductActions;
