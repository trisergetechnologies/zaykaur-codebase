"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";

type Props = {
  children: ReactNode;
};

/**
 * Renders children only when the user is signed in; otherwise redirects to
 * `/sign-in` with a safe `redirect` back to the current path.
 */
export function RequireAuth({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const api = useAuthStore.persist;
    if (!api?.onFinishHydration) {
      setHydrated(true);
      return;
    }
    const unsub = api.onFinishHydration(() => setHydrated(true));
    if (api.hasHydrated?.()) setHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (isAuthenticated) return;
    const redirect =
      pathname && pathname.startsWith("/") && !pathname.startsWith("//")
        ? pathname
        : "/";
    router.replace(`/sign-in?redirect=${encodeURIComponent(redirect)}`);
  }, [hydrated, isAuthenticated, pathname, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center bg-slate-50/60">
        <div
          className="h-9 w-9 animate-spin rounded-full border-4 border-pink-600 border-t-transparent"
          aria-hidden
        />
      </div>
    );
  }

  return <>{children}</>;
}
