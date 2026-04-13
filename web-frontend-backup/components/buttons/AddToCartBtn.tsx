"use client";

import React from "react";
import { Button } from "../ui/button";
import { ShoppingBag } from "lucide-react";
import useCartStore from "@/store/cartStore";
import { showToast } from "@/lib/showToast";
import { CartItem } from "@/types";

interface AddToCartBtnProps {
  product: CartItem;
  disabled?: boolean;
}

const AddToCartBtn = ({ product, disabled }: AddToCartBtnProps) => {
  const { addToCart } = useCartStore();

  const handleAddToCart = () => {
    if (disabled) return;
    addToCart(product);
    showToast("Added to Bag", product.images[0] as string, product.name);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled}
      variant="outline"
      className={`
        w-full h-14 rounded-md text-base font-bold flex items-center justify-center gap-3
        transition-all duration-200 border-2
        ${
          disabled
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white active:scale-[0.98]"
        }
      `}
    >
      <ShoppingBag size={18} strokeWidth={2.5} />
      ADD TO BAG
    </Button>
  );
};

export default AddToCartBtn;