"use client";

import { RequireAuth } from "@/components/auth/RequireAuth";

export default function MyOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
