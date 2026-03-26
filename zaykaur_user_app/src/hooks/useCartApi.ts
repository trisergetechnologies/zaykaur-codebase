import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import type { ApiCart } from "../types/api";
import { useAuthStore } from "../store/authStore";

export function useCartApi(autoFetch = true) {
  const { token } = useAuthStore();
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!token) {
      setCart(null);
      return;
    }
    setLoading(true);
    const res = await api.get<ApiCart>("/customer/cart");
    setLoading(false);
    if (res.success && res.data) setCart(res.data as ApiCart);
    else setCart(null);
  }, [token]);

  useEffect(() => {
    if (autoFetch) fetchCart();
  }, [autoFetch, fetchCart]);

  const addItem = async (
    productId: string,
    options: {
      variantId?: string | null;
      variantAttributes?: Record<string, string>;
      quantity?: number;
    }
  ) => {
    const quantity = options.quantity ?? 1;
    const body: {
      productId: string;
      variantId?: string;
      variantAttributes?: Record<string, string>;
      quantity: number;
    } = { productId, quantity };
    if (
      options.variantAttributes &&
      Object.keys(options.variantAttributes).length > 0
    ) {
      body.variantAttributes = options.variantAttributes;
    } else if (options.variantId) {
      body.variantId = options.variantId;
    }
    const res = await api.post<ApiCart>("/customer/cart", body);
    if (res.success) await fetchCart();
    return res;
  };

  const removeItem = async (productId: string, variantId?: string) => {
    const url = variantId
      ? `/customer/cart/${productId}?variantId=${encodeURIComponent(variantId)}`
      : `/customer/cart/${productId}`;
    const res = await api.delete<ApiCart>(url);
    if (res.success) await fetchCart();
    return res;
  };

  const clearCart = async () => {
    const res = await api.delete<ApiCart>("/customer/cart");
    if (res.success) await fetchCart();
    return res;
  };

  return {
    cart,
    loading,
    refetch: fetchCart,
    addItem,
    removeItem,
    clearCart,
    count: cart?.items?.length ?? 0,
  };
}
