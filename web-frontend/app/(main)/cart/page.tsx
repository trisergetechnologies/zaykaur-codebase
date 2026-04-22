"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import CartItems from "@/components/carts/CartItems";
import CartSummary from "@/components/carts/CartSummary";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import useCartStore from "@/store/cartStore";
import { Button } from "@/components/ui/button";

const CartPage = () => {
  const { fetchCart, cartItems } = useCartStore();
  const [cartReady, setCartReady] = useState(false);

  useEffect(() => {
    void fetchCart().finally(() => setCartReady(true));
  }, [fetchCart]);

  const hasItems = cartItems.length > 0;

  return (
    <section className="flex min-h-screen flex-col bg-slate-50/60 pb-10 sm:pb-12">
      <div className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col px-3 py-8 sm:px-6 sm:py-10 lg:px-8">
        {!cartReady ? (
          <div className="flex flex-1 flex-col items-center justify-center px-2 py-16">
            <div
              className="h-9 w-9 animate-spin rounded-full border-4 border-pink-600 border-t-transparent"
              aria-hidden
            />
          </div>
        ) : !hasItems ? (
          <div className="flex flex-1 flex-col items-center justify-center px-2 py-16">
            <div className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-12">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-pink-50">
                <ShoppingBag className="h-7 w-7 text-pink-600" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                Your cart is empty
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Add products to your cart to continue to checkout and delivery.
              </p>
              <Button
                asChild
                className="mt-8 rounded-lg bg-pink-600 px-8 text-xs font-semibold uppercase tracking-wide hover:bg-pink-700"
              >
                <Link href="/shop">Shop now</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <CheckoutSteps currentStep="cart" />
            <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <CartItems />
              </div>
              <div className="lg:col-span-4">
                <CartSummary />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CartPage;
