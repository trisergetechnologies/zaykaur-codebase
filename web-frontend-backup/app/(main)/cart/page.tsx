"use client";

import { useEffect } from "react";
import CartItems from "@/components/carts/CartItems";
import CartSummary from "@/components/carts/CartSummary";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import useCartStore from "@/store/cartStore";

const CartPage = () => {
  const { fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <section className="min-h-screen bg-slate-50/60 pt-10 pb-12">
      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <CheckoutSteps currentStep="cart" />
        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <CartItems />
          </div>
          <div className="lg:col-span-4">
            <CartSummary />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
