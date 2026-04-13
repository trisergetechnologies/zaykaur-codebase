"use client";

import React, { useEffect, useState } from "react";
import { X, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import AddToCartBtn from "@/components/buttons/AddToCartBtn";
import useWishlistStore from "@/store/wishlistStore";
import useAuthStore from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { motion, AnimatePresence } from "framer-motion";

const WishlistPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { wishlistItems, removeFromWishlist, fetchWishlist } = useWishlistStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) void fetchWishlist();
  }, [isAuthenticated, fetchWishlist]);

  if (!isMounted) return null;

  const items = isAuthenticated ? wishlistItems : [];

  return (
    <div className="px-4 py-12 lg:px-16 bg-white min-h-screen">
      <div className="max-w-screen-xl mx-auto">
        
        {/* HEADER: Clean & Minimal */}
        <div className="mb-10 border-b border-gray-100 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              My Wishlist
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isAuthenticated ? (
                <>
                  You have <span className="font-semibold text-blue-600">{items.length} items</span> saved for later.
                </>
              ) : (
                <>Sign in to save items to your wishlist.</>
              )}
            </p>
          </div>
          {isAuthenticated && items.length > 0 && (
            <Link href="/shop" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1">
              Continue Shopping <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* EMPTY STATE: Better Visuals */}
        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Heart size={32} className="text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isAuthenticated ? "Your wishlist is empty" : "Sign in to use your wishlist"}
            </h2>
            <p className="text-gray-500 mt-2 mb-8 max-w-xs mx-auto">
              {isAuthenticated
                ? "Save your favorite items here to keep track of what you love."
                : "Create an account or sign in to save products and sync your list across devices."}
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href={`/sign-in?redirect=${encodeURIComponent("/wishlist")}`}
                  className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-blue-600 transition-all shadow-lg shadow-gray-200"
                >
                  Sign in
                </Link>
                <Link
                  href={`/sign-up?redirect=${encodeURIComponent("/wishlist")}`}
                  className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-all"
                >
                  Create account
                </Link>
              </div>
            ) : (
              <Link
                href="/shop"
                className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-blue-600 transition-all shadow-lg shadow-gray-200"
              >
                Explore Products
              </Link>
            )}
          </motion.div>
        ) : (
          /* WISHLIST GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative flex flex-col bg-white"
                >
                  {/* IMAGE: Square aspect ratio to reduce height */}
                  <div className="relative aspect-square rounded-2xl bg-gray-50 overflow-hidden border border-gray-100">
                    <Link href={`/shop/product/${item.id}`} className="block h-full w-full">
                      <Image
                        src={item.images?.[0]}
                        alt={item.name}
                        fill
                        className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                      />
                    </Link>

                    {/* Quick Remove */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all border border-gray-100"
                      title="Remove from wishlist"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* CONTENT */}
                  <div className="pt-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <Link
                        href={`/shop/product/${item.id}`}
                        className="text-sm font-bold text-gray-900 line-clamp-1 hover:text-blue-600 transition flex-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm font-black text-gray-900 ml-2">
                        ₹{formatPrice(item.price)}
                      </p>
                    </div>

                    <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-3">
                      {item.category || "Premium Product"}
                    </p>

                    <div className="mt-auto">
                      <AddToCartBtn
                        product={{
                          ...item,
                          quantity: 1,
                          selectedColor: "",
                        }}
                        // Assuming AddToCartBtn supports a "minimal" or "outline" variant
                        className="w-full rounded-xl py-2.5 text-xs font-bold"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;