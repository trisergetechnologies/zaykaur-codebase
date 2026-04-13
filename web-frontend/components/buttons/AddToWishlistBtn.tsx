"use client";

import React from "react";
import { Heart } from "lucide-react";
import useWishlistStore from "@/store/wishlistStore";
import useAuthStore from "@/store/authStore";
import { Product } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddToWishlistBtnProps {
  product: Product;
}

const AddToWishlistBtn = ({ product }: AddToWishlistBtnProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const handleToggle = () => {
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=${encodeURIComponent("/wishlist")}`);
      return;
    }
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast("Removed from wishlist");
    } else {
      addToWishlist(product);
      toast("Added to wishlist");
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full hover:bg-gray-100 transition"
      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        size={20}
        fill={inWishlist ? "#db2777" : "none"}
        className={inWishlist ? "text-pink-600" : "text-gray-500"}
      />
    </button>
  );
};

export default AddToWishlistBtn;
