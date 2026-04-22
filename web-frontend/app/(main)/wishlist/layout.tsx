"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
