'use client';
import { Product } from '@/types';
import { create } from 'zustand';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { normalizeProducts } from '@/lib/normalizeProduct';

function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!parsed?.state?.token;
  } catch {
    return false;
  }
}

interface WishlistState {
  wishlistItems: Product[];
  resetWishlist: () => void;
  addToWishlist: (newItem: Product) => void;
  removeFromWishlist: (itemId: number | string) => void;
  isInWishlist: (itemId: number | string) => boolean;
  fetchWishlist: () => Promise<void>;
}

const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistItems: [],

  resetWishlist: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem('wishlist-items');
      } catch {
        /* ignore */
      }
    }
    set({ wishlistItems: [] });
  },

  fetchWishlist: async () => {
    if (!isLoggedIn()) {
      set({ wishlistItems: [] });
      return;
    }
    try {
      const res = await apiGet<any>('/api/v1/customer/wishlist');
      if (res.success && res.data !== undefined) {
        const items = Array.isArray(res.data) ? res.data : [];
        set({ wishlistItems: normalizeProducts(items) });
        return;
      }
      // Never keep stale/default-looking items when API has no valid payload.
      set({ wishlistItems: [] });
    } catch {
      set({ wishlistItems: [] });
    }
  },

  addToWishlist: (newItem: Product) => {
    if (!isLoggedIn()) return;

    const existing = get().wishlistItems.find(
      (item) => String(item.id) === String(newItem.id)
    );
    if (existing) return;

    set((state) => ({
      wishlistItems: [...state.wishlistItems, { ...newItem }],
    }));

    const productId = newItem._id || String(newItem.id);
    apiPost('/api/v1/customer/wishlist', { productId }).catch(() => {});
  },

  removeFromWishlist: (itemId: number | string) => {
    if (!isLoggedIn()) return;

    const item = get().wishlistItems.find(
      (i) => String(i.id) === String(itemId)
    );

    set((state) => ({
      wishlistItems: state.wishlistItems.filter(
        (i) => String(i.id) !== String(itemId)
      ),
    }));

    const productId = item?._id || String(itemId);
    apiDelete(`/api/v1/customer/wishlist/${productId}`).catch(() => {});
  },

  isInWishlist: (itemId: number | string) => {
    if (!isLoggedIn()) return false;
    return get().wishlistItems.some(
      (item) => String(item.id) === String(itemId)
    );
  },
}));

export default useWishlistStore;
