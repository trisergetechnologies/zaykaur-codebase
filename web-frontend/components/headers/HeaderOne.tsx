"use client";

import { cn } from "@/lib/utils";
import {
  Heart,
  Home,
  LayoutGrid,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Store,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import MegaMenuNav from "./MegaMenuNav";
import SearchCombobox from "@/components/search/SearchCombobox";

import { getSellerSignInUrl } from "@/lib/sellerPortal";
import { topCategories } from "@/data/category/topCategories";
import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";

const HeaderOne = () => {

  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [navMounted, setNavMounted] = useState(false);

  const { cartItems } = useCartStore();
  const { wishlistItems, fetchWishlist, resetWishlist } = useWishlistStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const cartCount = cartItems?.length || 0;
  const wishlistCount = isAuthenticated ? wishlistItems?.length || 0 : 0;
  const sellerPortalUrl = getSellerSignInUrl();

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
    setNavMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
    <header className="sticky top-0 z-[100] w-full border-b border-purple-200/60 bg-purple-50/80 backdrop-blur-xl">

      {/* MAIN HEADER */}
      <div className="max-w-screen-xl mx-auto px-4 md:px-6 h-[72px] flex items-center gap-6">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="text-xl md:text-2xl font-black tracking-tight text-gray-900">
            ZAYKAUR
          </span>
          <span className="text-2xl md:text-3xl font-black text-pink-600">.</span>
        </Link>

        {/* SEARCH */}
        <div className="hidden lg:block flex-1 max-w-[500px]">
          <Suspense fallback={null}>
            <SearchCombobox variant="header" />
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

    {/* DROPDOWN — top-full + pt-2 keeps hit area continuous (top-[120%] left a hover dead zone) */}
    <div
      className="
      absolute right-0 top-full z-50 pt-2
      w-52
      opacity-0 invisible
      group-hover:opacity-100 group-hover:visible
      transition
    "
    >
      <div
        className="
        rounded-lg border border-purple-200/70 bg-purple-50/95 shadow-lg backdrop-blur
        overflow-hidden
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

</div>

        {/* Mobile icons */}
        <div className="flex lg:hidden items-center gap-3 ml-auto">
          <Link href="/search" className="p-2 text-gray-700 hover:text-pink-600">
            <Search size={22} />
          </Link>
          <Link href="/cart" className="p-2 text-gray-700 hover:text-pink-600 relative">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-pink-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            className="p-2"
            onClick={() => setIsOpen(true)}
          >
            <Menu size={26} />
          </button>
        </div>

      </div>

      {/* MOBILE SEARCH BAR */}
      <div className="lg:hidden border-t border-purple-200/60 px-3 py-2">
        <Suspense fallback={null}>
          <SearchCombobox variant="mobile" />
        </Suspense>
      </div>

      {/* CATEGORY BAR */}
      <div className="hidden lg:block border-t border-purple-200/60 bg-purple-50/70 backdrop-blur">

        <div className="max-w-screen-xl mx-auto px-2">

          <div className="flex items-center gap-6 h-[48px] overflow-x-auto scrollbar-hide whitespace-nowrap pl-1">

            <MegaMenuNav />

          </div>

        </div>

      </div>

    </header>

      {/* Mobile nav: portaled to body so it always sits above page content (PDP, reviews, etc.) */}
      {navMounted &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-[1000] lg:hidden transition-opacity duration-200",
              isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            )}
            aria-hidden={!isOpen}
          >
            <button
              type="button"
              className="absolute inset-0 bg-neutral-950/55"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            />
            <nav
              className={cn(
                "absolute left-0 top-0 flex h-full w-[min(88vw,320px)] max-w-full flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
                isOpen ? "translate-x-0" : "-translate-x-full"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-4">
                <Link
                  href="/"
                  className="text-lg font-black tracking-tight text-gray-900"
                  onClick={() => setIsOpen(false)}
                >
                  ZAYKAUR<span className="text-pink-600">.</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-gray-700 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Menu
                </p>
                <ul className="space-y-0.5">
                  <li>
                    <Link
                      href="/"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      <Home size={18} className="shrink-0 text-gray-600" />
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/shop"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      <Store size={18} className="shrink-0 text-gray-600" />
                      Shop
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/search"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      <Search size={18} className="shrink-0 text-gray-600" />
                      Search
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/category"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-pink-700 hover:bg-pink-50"
                    >
                      <LayoutGrid size={18} className="shrink-0" />
                      All categories
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/wishlist"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      <Heart size={18} className="shrink-0 text-gray-600" />
                      Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto rounded-full bg-gray-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cart"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      <ShoppingBag size={18} className="shrink-0 text-gray-600" />
                      Cart
                      {cartCount > 0 && (
                        <span className="ml-auto rounded-full bg-pink-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </li>
                  <li>
                    {isAuthenticated ? (
                      <Link
                        href="/my-account"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                      >
                        <User size={18} className="shrink-0 text-gray-600" />
                        {user?.name?.split(" ")[0] ?? "Account"}
                      </Link>
                    ) : (
                      <Link
                        href="/sign-in"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                      >
                        <User size={18} className="shrink-0 text-gray-600" />
                        Sign in
                      </Link>
                    )}
                  </li>
                  {isAuthenticated && (
                    <>
                      <li>
                        <Link
                          href="/orders"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50"
                        >
                          <Package size={18} className="shrink-0 text-gray-600" />
                          Orders
                        </Link>
                      </li>
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            handleLogout();
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Log out
                        </button>
                      </li>
                    </>
                  )}
                </ul>

                <p className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Shop by category
                </p>
                <p className="mb-3 text-xs leading-relaxed text-gray-500">
                  Jump to a department; scroll if the list is long.
                </p>
                <div className="max-h-[min(40vh,320px)] overflow-y-auto rounded-xl border border-gray-100 bg-gray-50">
                  <ul className="divide-y divide-gray-100">
                    {topCategories.map((cat) => (
                      <li key={cat.slug}>
                        <Link
                          href={`/shop?category=${cat.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="block px-3 py-2.5 text-sm text-gray-800 hover:bg-white hover:text-pink-700"
                        >
                          {cat.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={sellerPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block rounded-lg border border-gray-200 px-3 py-3 text-center text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Become a Supplier
                </a>
              </div>
            </nav>
          </div>,
          document.body
        )}
    </>
  );
};

export default HeaderOne;