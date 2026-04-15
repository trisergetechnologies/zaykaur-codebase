"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getToken, setToken, removeToken } from "@/helper/tokenHelper";
import { setupAxiosInterceptors } from "@/helper/setupAxios";
import { apiUrl } from "@/lib/api";

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface SellerAccessState {
  onboardingStatus: string;
  isVerified: boolean;
  isActive: boolean;
  isApproved: boolean;
}

export interface AuthContextType {
  user: User | null;
  sellerAccess: SellerAccessState | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (token: string, user?: User | null) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(data: Record<string, unknown>): User {
  return {
    _id: String(data._id || data.id || ""),
    id: String(data.id || data._id || ""),
    name: String(data.name ?? ""),
    email: String(data.email ?? ""),
    phone: data.phone ? String(data.phone) : undefined,
    role: String(data.role ?? "customer"),
  };
}

const DEFAULT_SELLER_ACCESS: SellerAccessState = {
  onboardingStatus: "draft",
  isVerified: false,
  isActive: false,
  isApproved: false,
};

function mapSellerAccess(data: Record<string, unknown>): SellerAccessState {
  const onboardingStatus = String(data?.onboardingStatus || "draft");
  const isVerified = Boolean(data?.isVerified);
  const isActive = Boolean(data?.isActive);
  const isApproved = onboardingStatus === "approved" && isVerified && isActive;
  return { onboardingStatus, isVerified, isActive, isApproved };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sellerAccess, setSellerAccess] = useState<SellerAccessState | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  const fetchSellerAccess = useCallback(async (token: string, role: string) => {
    if (role !== "seller") {
      setSellerAccess(null);
      return;
    }
    try {
      const onboardingRes = await axios.get(apiUrl("/api/v1/seller/onboarding/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onboardingRes.data?.success) {
        setSellerAccess(mapSellerAccess((onboardingRes.data?.data || {}) as Record<string, unknown>));
      } else {
        setSellerAccess(DEFAULT_SELLER_ACCESS);
      }
    } catch {
      setSellerAccess(DEFAULT_SELLER_ACCESS);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const res = await axios.get(apiUrl("/api/v1/user/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success && res.data?.data) {
          const normalized = normalizeUser(res.data.data as Record<string, unknown>);
          setUser(normalized);
          await fetchSellerAccess(token, normalized.role);
        } else {
          removeToken();
          setUser(null);
          setSellerAccess(null);
        }
      } catch {
        removeToken();
        setUser(null);
        setSellerAccess(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
  }, [fetchSellerAccess]);

  const login = async (token: string, userFromLogin?: User | null) => {
    setToken(token);
    if (userFromLogin) {
      const normalized = normalizeUser(userFromLogin as unknown as Record<string, unknown>);
      setUser(normalized);
      await fetchSellerAccess(token, normalized.role);
      return;
    }
    try {
      const res = await axios.get(apiUrl("/api/v1/user/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success && res.data?.data) {
        const normalized = normalizeUser(res.data.data as Record<string, unknown>);
        setUser(normalized);
        await fetchSellerAccess(token, normalized.role);
      } else {
        removeToken();
        setUser(null);
        setSellerAccess(null);
      }
    } catch {
      removeToken();
      setUser(null);
      setSellerAccess(null);
    }
  };

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    setSellerAccess(null);
    router.push("/signin");
  }, [router]);

  const refreshUser = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axios.get(apiUrl("/api/v1/user/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success && res.data?.data) {
        const normalized = normalizeUser(res.data.data as Record<string, unknown>);
        setUser(normalized);
        await fetchSellerAccess(token, normalized.role);
      }
    } catch {
      // keep current user on refresh failure
    }
  };

  useEffect(() => {
    setupAxiosInterceptors(logout);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        sellerAccess,
        isAuthenticated: !!user,
        isAuthLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
