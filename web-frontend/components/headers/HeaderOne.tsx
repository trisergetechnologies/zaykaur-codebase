"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ShoppingBag, Heart, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import SearchBox from "./SearchBox";
import MegaMenuNav from "./MegaMenuNav";

import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";
import useAuthStore from "@/store/authStore";
import { topCategories } from "@/data/category/topCategories";

const HeaderOne = () => {

  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { cartItems } = useCartStore();
  const { wishlistItems, fetchWishlist, resetWishlist } = useWishlistStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const cartCount = cartItems?.length || 0;
  const wishlistCount = isAuthenticated ? wishlistItems?.length || 0 : 0;
  const sellerPortalUrl = `${(process.env.NEXT_PUBLIC_SELLER_PORTAL_URL || "http://localhost:3001").replace(/\/+$/, "")}/signin`;

  useEffect(() => {
    if (isAuthenticated) {
      void fetchWishlist();
    } else {
      resetWishlist();
    }
  }, [isAuthenticated, fetchWishlist, resetWishlist]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    router.push("/");
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-purple-200/60 bg-purple-50/80 backdrop-blur-xl">

      {/* MAIN HEADER */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 h-[72px] flex items-center gap-6">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="text-xl md:text-2xl font-black tracking-tight">
            ZAYKAUR
          </span>
          <span className="text-2xl md:text-3xl font-black text-pink-600">.</span>
        </Link>

        {/* SEARCH */}
        <div className="hidden lg:block flex-1 max-w-[500px]">
          <Suspense fallback={null}>
            <SearchBox />
          </Suspense>
        </div>

        {/* RIGHT SECTION */}
       <div className="hidden lg:flex items-center gap-6 text-sm text-gray-700 ml-auto">

  {/* Supplier */}
  <a
    href={sellerPortalUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-pink-600 transition"
  >
    Become a Supplier
  </a>

  {/* Divider */}
  <div className="h-6 w-px bg-gray-300" />

  {/* Wishlist */}
  <Link
    href="/wishlist"
    className="flex flex-col items-center text-xs hover:text-pink-600 transition relative"
  >
    <Heart
      size={20}
      fill={wishlistCount > 0 ? "#db2777" : "none"}
      className={wishlistCount > 0 ? "text-pink-600" : ""}
    />

    {wishlistCount > 0 && (
      <span className="absolute -top-1 right-2 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
        {wishlistCount}
      </span>
    )}

    <span className="mt-1">Wishlist</span>
  </Link>

  {/* Cart */}
  <Link
    href="/cart"
    className="flex flex-col items-center text-xs hover:text-pink-600 transition relative"
  >
    <ShoppingBag size={20} />

    {cartCount > 0 && (
      <span className="absolute -top-1 right-2 bg-pink-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
        {cartCount}
      </span>
    )}

    <span className="mt-1">Cart</span>
  </Link>

  {/* ACCOUNT */}
  <div className="relative group flex flex-col items-center text-xs cursor-pointer">

    <User size={20} />

    <span className="mt-1">
      {isAuthenticated ? user?.name?.split(" ")[0] : "Profile"}
    </span>

    {/* DROPDOWN */}
    <div
      className="
      absolute right-0 top-[120%]
      w-52 bg-purple-50/95 border border-purple-200/70 rounded-lg shadow-lg backdrop-blur
      opacity-0 invisible
      group-hover:opacity-100 group-hover:visible
      transition
      z-50
    "
    >

      {isAuthenticated ? (
        <>
          <Link
            href="/my-account"
            className="block px-4 py-3 hover:bg-gray-50"
          >
            Your Account
          </Link>

          <Link
            href="/orders"
            className="block px-4 py-3 hover:bg-gray-50"
          >
            Your Orders
          </Link>

          <div className="border-t" />

          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-3 text-red-600 font-medium hover:bg-gray-50"
          >
            Logout
          </button>
        </>
      ) : (
        <Link
          href="/sign-in"
          className="block px-4 py-3 text-pink-600 font-medium hover:bg-gray-50"
        >
          Login / Register
        </Link>
      )}

    </div>

  </div>

</div>

        {/* Mobile Menu */}
        <button
          className="lg:hidden p-2 ml-auto"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={26} />
        </button>

      </div>

      {/* CATEGORY BAR */}
      <div className="hidden lg:block border-t border-purple-200/60 bg-purple-50/70 backdrop-blur">

        <div className="max-w-screen-xl mx-auto px-2">

          <div className="flex items-center gap-6 h-[48px] overflow-x-auto scrollbar-hide whitespace-nowrap pl-1">

            <MegaMenuNav />

          </div>

        </div>

      </div>

      {/* MOBILE DRAWER */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-[110]",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setIsOpen(false)}
      >

        <div
          className={cn(
            "fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-purple-50 shadow-xl transition-transform duration-300",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >

          {/* Drawer Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <span className="text-lg font-black">
              ZAYKAUR<span className="text-pink-600">.</span>
            </span>

            <button onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* Categories */}
          <div className="p-6 space-y-4">

            {topCategories.map((cat) => (

              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                onClick={() => setIsOpen(false)}
                className="block text-lg font-medium text-gray-700 hover:text-pink-600"
              >
                {cat.label}
              </Link>

            ))}

          </div>

        </div>

      </div>

    </header>
  );
};

export default HeaderOne;