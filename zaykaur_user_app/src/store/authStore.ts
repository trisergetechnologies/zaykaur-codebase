import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setStoredToken } from "../lib/api";
import type { ApiUser } from "../types/api";

interface AuthState {
  token: string | null;
  user: ApiUser | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: ApiUser | null) => void;
  loadUser: () => Promise<void>;
  logout: () => void;
}

function normalizeUser(data: ApiUser & { _id?: string }): ApiUser {
  return {
    ...data,
    id: data.id ?? data._id ?? "",
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,

      setToken: (token) => {
        setStoredToken(token);
        set({ token });
      },

      setUser: (user) => set({ user }),

      loadUser: async () => {
        const { token } = get();
        if (!token) {
          set({ user: null });
          return;
        }
        set({ isLoading: true });
        const res = await api.get<ApiUser & { _id?: string }>("/user/me");
        set({ isLoading: false });
        if (res.success && res.data) {
          set({ user: normalizeUser(res.data) });
        } else {
          set({ user: null, token: null });
          setStoredToken(null);
        }
      },

      logout: () => {
        setStoredToken(null);
        set({ token: null, user: null });
      },
    }),
    {
      name: "zaykaur-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ token: s.token, user: s.user }),
    }
  )
);
