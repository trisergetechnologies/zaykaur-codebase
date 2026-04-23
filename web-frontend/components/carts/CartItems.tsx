"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import useCartStore from "@/store/cartStore";
import { formatPrice } from "@/lib/formatPrice";

const CartItems = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCartStore();

  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-900">
            Cart Items ({cartItems.length})
          </h2>
          <p className="text-xs text-slate-500">Prices and availability may change at checkout</p>
        </div>
      </div>
      {cartItems.map((item) => {
        const subtotal = item.price * item.quantity;
        const hasDiscount = (item.originalPrice ?? item.price) > item.price;

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex gap-4">
              <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <Image
                  src={item.images?.[0] || "/placeholder-product.png"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col justify-between py-0.5">
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug text-slate-800">
                      {item.name}
                    </h3>
                  </div>

                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-base font-semibold text-slate-900">
                      ₹{formatPrice(item.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{formatPrice(item.originalPrice ?? item.price)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex h-8 items-center rounded-md border border-slate-200">
                    <button
                      disabled={item.quantity <= 1}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-full border-r border-slate-200 px-2 transition hover:bg-slate-50 disabled:opacity-30"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus size={12} strokeWidth={3} />
                    </button>

                    <span className="w-8 text-center text-xs font-semibold text-slate-800">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-full border-l border-slate-200 px-2 transition hover:bg-slate-50"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus size={12} strokeWidth={3} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition-colors hover:text-red-600"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
              <span className="text-xs font-medium text-slate-500">Assured ZayKaur seller</span>
              <div className="text-right">
                <span className="mr-2 text-xs font-medium text-slate-400">Subtotal:</span>
                <span className="text-sm font-semibold text-slate-900">₹{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartItems;