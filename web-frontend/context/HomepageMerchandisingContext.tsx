"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiGet } from "@/lib/api";
import type { HomepagePayload } from "@/types/homepage";

type HomepageMerchandisingContextValue = {
  payload: HomepagePayload | null;
  loading: boolean;
};

const HomepageMerchandisingContext =
  createContext<HomepageMerchandisingContextValue | null>(null);

export function HomepageMerchandisingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [payload, setPayload] = useState<HomepagePayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiGet<HomepagePayload>("/api/v1/public/homepage")
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data && typeof res.data === "object") {
          setPayload(res.data as HomepagePayload);
        } else {
          setPayload(null);
        }
      })
      .catch(() => {
        if (!cancelled) setPayload(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ payload, loading }),
    [payload, loading]
  );

  return (
    <HomepageMerchandisingContext.Provider value={value}>
      {children}
    </HomepageMerchandisingContext.Provider>
  );
}

export function useHomepageMerchandising(): HomepageMerchandisingContextValue {
  const ctx = useContext(HomepageMerchandisingContext);
  if (!ctx) {
    return { payload: null, loading: false };
  }
  return ctx;
}
