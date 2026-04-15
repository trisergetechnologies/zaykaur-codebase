"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { CartItem } from "@/types";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!parsed?.state?.token;
  } catch {
    return false;
  }
}

interface ApiCartData {
  items: any[];
  itemsTotal: number;
  taxTotal: number;
  shippingEstimate: number;
  grandTotal: number;
}

type CartStore = {
  cartItems: CartItem[];

  _apiTotals: {
    itemsTotal: number;
    taxTotal: number;
    shippingEstimate: number;
    grandTotal: number;
  } | null;

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  fetchCart: () => Promise<void>;
  /** After login: push each guest line to the server cart, then refresh. No-op if not logged in or empty. */
  mergeGuestCartIntoServer: (guestItems: CartItem[]) => Promise<void>;

  getTotalPrice: () => number;
  getTax: () => number;
  getShippingFee: () => number;
  getTotalAmount: () => number;
};

function mapApiCartItems(items: any[]): CartItem[] {
  return (items ?? []).map((item: any) => {
    const rawPid = item.productId?._id ?? item.productId ?? item.id;
    const pid = rawPid != null ? String(rawPid) : "";
    const vid = item.variantId != null ? String(item.variantId) : "";
    const lineId = vid ? `${pid}-${vid}` : pid;

    const unit = Number(item.unitPrice ?? item.price ?? 0);
    let list = item.originalPrice != null ? Number(item.originalPrice) : unit;
    if (!Number.isFinite(list)) list = unit;
    if (list < unit) list = unit;

    return {
      id: lineId,
      price: unit,
      originalPrice: list,
      name: item.name || item.productId?.name || "",
      slug: item.productId?.slug,
      discount: 0,
      images: item.image ? [item.image] : [],
      category: item.productId?.category || "",
      quantity: item.quantity ?? 1,
      stock: item.stock,
      productId: pid,
      variantId: item.variantId,
    };
  });
}

const useCartStore = create<CartStore>((set, get) => ({
  cartItems: [],
  _apiTotals: null,

  fetchCart: async () => {
    if (!isLoggedIn()) return;
    try {
      const res = await apiGet<ApiCartData>("/api/v1/customer/cart");
      if (res.success && res.data) {
        set({
          cartItems: mapApiCartItems(res.data.items),
          _apiTotals: {
            itemsTotal: res.data.itemsTotal,
            taxTotal: res.data.taxTotal,
            shippingEstimate: res.data.shippingEstimate,
            grandTotal: res.data.grandTotal,
          },
        });
        return;
      }
      set({ cartItems: [], _apiTotals: null });
    } catch {
      set({ cartItems: [], _apiTotals: null });
    }
  },

  mergeGuestCartIntoServer: async (guestItems) => {
    if (!guestItems.length) return;
    if (!isLoggedIn()) return;
    for (const item of guestItems) {
      const productId = (item.productId || String(item.id || "")).trim();
      if (!productId) continue;
      const qty = Math.max(1, Number(item.quantity) || 1);
      const body: { productId: string; quantity: number; variantId?: string } = {
        productId,
        quantity: qty,
      };
      if (item.variantId) body.variantId = String(item.variantId);
      try {
        const res = await apiPost<ApiCartData>("/api/v1/customer/cart", body);
        if (res.success && res.data) {
          set({
            cartItems: mapApiCartItems(res.data.items),
            _apiTotals: {
              itemsTotal: res.data.itemsTotal,
              taxTotal: res.data.taxTotal,
              shippingEstimate: res.data.shippingEstimate,
              grandTotal: res.data.grandTotal,
            },
          });
        } else if (res.message) {
          toast.error(res.message);
        }
      } catch {
        toast.error("Could not move an item to your cart. Try adding it again.");
      }
    }
    await get().fetchCart();
  },

  addToCart: (item) => {
    if (isLoggedIn()) {
      const productId = item.productId || String(item.id);
      apiPost<ApiCartData>("/api/v1/customer/cart", {
        productId,
        variantId: item.variantId,
        quantity: item.quantity || 1,
      })
        .then((res) => {
          if (res.success && res.data) {
            set({
              cartItems: mapApiCartItems(res.data.items),
              _apiTotals: {
                itemsTotal: res.data.itemsTotal,
                taxTotal: res.data.taxTotal,
                shippingEstimate: res.data.shippingEstimate,
                grandTotal: res.data.grandTotal,
              },
            });
            return;
          }
          if (res.message) {
            toast.error(res.message);
          }
        })
        .catch(() => {
          toast.error("Could not update cart. Check your connection and try again.");
        });
    } else {
      set((state) => {
        const existing = state.cartItems.find((c) => c.id === item.id);
        if (existing) {
          return {
            cartItems: state.cartItems.map((c) =>
              c.id === item.id
                ? { ...c, quantity: c.quantity + (item.quantity || 1) }
                : c
            ),
          };
        }
        return { cartItems: [...state.cartItems, item] };
      });
    }
  },

  removeFromCart: (id) => {
    if (isLoggedIn()) {
      const item = get().cartItems.find((c) => String(c.id) === String(id));
      const productId = item?.productId || String(id);
      const variantQuery = item?.variantId ? `?variantId=${item.variantId}` : "";
      apiDelete<ApiCartData>(`/api/v1/customer/cart/${productId}${variantQuery}`)
        .then((res) => {
          if (res.success && res.data) {
            set({
              cartItems: mapApiCartItems(res.data.items),
              _apiTotals: {
                itemsTotal: res.data.itemsTotal,
                taxTotal: res.data.taxTotal,
                shippingEstimate: res.data.shippingEstimate,
                grandTotal: res.data.grandTotal,
              },
            });
            return;
          }
          if (res.message) toast.error(res.message);
        })
        .catch(() => {
          toast.error("Could not update cart.");
        });
    } else {
      set((state) => ({
        cartItems: state.cartItems.filter((item) => String(item.id) !== String(id)),
      }));
    }
  },

  updateQuantity: (id, quantity) => {
    if (isLoggedIn()) {
      const item = get().cartItems.find((c) => String(c.id) === String(id));
      if (!item) return;
      const productId = item.productId || String(id);
      apiPost<ApiCartData>("/api/v1/customer/cart", {
        productId,
        variantId: item.variantId,
        quantity: quantity - item.quantity,
      })
        .then((res) => {
          if (res.success && res.data) {
            set({
              cartItems: mapApiCartItems(res.data.items),
              _apiTotals: {
                itemsTotal: res.data.itemsTotal,
                taxTotal: res.data.taxTotal,
                shippingEstimate: res.data.shippingEstimate,
                grandTotal: res.data.grandTotal,
              },
            });
            return;
          }
          if (res.message) toast.error(res.message);
        })
        .catch(() => {
          toast.error("Could not update cart.");
        });
    } else {
      set((state) => ({
        cartItems: state.cartItems.map((item) =>
          String(item.id) === String(id) ? { ...item, quantity } : item
        ),
      }));
    }
  },

  clearCart: () => {
    if (isLoggedIn()) {
      apiDelete("/api/v1/customer/cart").catch(() => {});
    }
    set({ cartItems: [], _apiTotals: null });
  },

  getTotalPrice: () => {
    const { _apiTotals, cartItems } = get();
    if (_apiTotals) return _apiTotals.itemsTotal;
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getTax: () => {
    const { _apiTotals } = get();
    if (_apiTotals) return _apiTotals.taxTotal;
    return get().getTotalPrice() * 0.05;
  },

  getShippingFee: () => {
    const { _apiTotals } = get();
    if (_apiTotals) return _apiTotals.shippingEstimate;
    return get().getTotalPrice() > 999 ? 0 : 60;
  },

  getTotalAmount: () => {
    const { _apiTotals } = get();
    if (_apiTotals) return _apiTotals.grandTotal;
    return get().getTotalPrice() + get().getTax() + get().getShippingFee();
  },
}));

export default useCartStore;
