"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiGet, apiPost, apiPut, ApiResponse } from "@/lib/api";
import useWishlistStore from "@/store/wishlistStore";
import useCartStore from "@/store/cartStore";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  addresses?: any[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<ApiResponse>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    accountType?: "customer" | "seller"
  ) => Promise<ApiResponse>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<ApiResponse>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<ApiResponse>;
  setLoading: (v: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setLoading: (v) => set({ isLoading: v }),

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const guestCartSnapshot = useCartStore.getState().cartItems.map((c) => ({ ...c }));
          useWishlistStore.getState().resetWishlist();
          useCartStore.getState().clearCart();
          const res = await apiPost<{
            token: string;
            refreshToken?: string | null;
            user: AuthUser;
          }>("/api/v1/auth/login", { email, password });
          if (res.success && res.data) {
            set({
              token: res.data.token,
              refreshToken: res.data.refreshToken ?? null,
              user: res.data.user,
              isAuthenticated: true,
            });
            await useWishlistStore.getState().fetchWishlist();
            await useCartStore.getState().fetchCart();
            await useCartStore.getState().mergeGuestCartIntoServer(guestCartSnapshot);
          }
          return res;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password, phone, accountType) => {
        set({ isLoading: true });
        try {
          if (accountType === "seller") {
            return {
              success: false,
              message:
                "Seller signup has moved to seller.zaykaur.com. Please register there.",
              data: null,
            };
          }
          const guestCartSnapshot = useCartStore.getState().cartItems.map((c) => ({ ...c }));
          useWishlistStore.getState().resetWishlist();
          useCartStore.getState().clearCart();
          const res = await apiPost<{
            token: string;
            refreshToken?: string | null;
            user: AuthUser;
          }>("/api/v1/auth/register", {
            name,
            email,
            password,
            ...(phone ? { phone } : {}),
            accountType: "customer",
            sellerRegistration: false,
          });
          if (res.success && res.data) {
            set({
              token: res.data.token,
              refreshToken: res.data.refreshToken ?? null,
              user: res.data.user,
              isAuthenticated: true,
            });
            await useWishlistStore.getState().fetchWishlist();
            await useCartStore.getState().fetchCart();
            await useCartStore.getState().mergeGuestCartIntoServer(guestCartSnapshot);
          }
          return res;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        useWishlistStore.getState().resetWishlist();
        useCartStore.getState().clearCart();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      forgotPassword: async (email) => {
        return apiPost("/api/v1/auth/forgot-password", { email });
      },

      fetchProfile: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await apiGet<AuthUser>("/api/v1/user/me");
          if (res.success && res.data) {
            set({ user: res.data, isAuthenticated: true });
          }
        } catch {
          // token may be expired
        }
      },

      updateProfile: async (data) => {
        return apiPut("/api/v1/user/me", data);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
