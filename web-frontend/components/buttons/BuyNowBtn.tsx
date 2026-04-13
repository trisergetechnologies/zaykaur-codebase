"use client";

import React from "react";
import { Button } from "../ui/button";
import { Zap } from "lucide-react";
import useCartStore from "@/store/cartStore";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import { CartItem } from "@/types";

interface BuyNowBtnProps {
  product: CartItem;
  disabled?: boolean;
}

const BuyNowBtn = ({ product, disabled }: BuyNowBtnProps) => {
  const { addToCart } = useCartStore();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleBuyNow = () => {
    if (disabled) return;
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }
    addToCart(product);
    router.push("/checkout");
  };

  return (
    <Button
      onClick={handleBuyNow}
      disabled={disabled}
      className={`
        w-full h-14 rounded-md text-base font-bold flex items-center justify-center gap-3
        transition-all duration-200 shadow-md
        ${
          disabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-[#ff3f6c] text-white hover:bg-[#e63962] shadow-pink-200 active:scale-[0.98]"
        }
      `}
    >
      <Zap size={18} fill="currentColor" />
      BUY NOW
    </Button>
  );
};

export default BuyNowBtn;