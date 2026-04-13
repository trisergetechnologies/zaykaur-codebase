"use client";

import HeaderOne from "@/components/headers/HeaderOne";
import Footer from "@/components/footers/Footer";
import ScrollToTop from "@/components/others/ScrollToTop";
import { Toaster } from "sonner";
import { StoreProvider } from "@/lib/store/StoreProvider";
import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
  store,
}: {
  children: React.ReactNode;
  store: any;
}) {

  const pathname = usePathname();

  const hideHeader =
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout");

  return (
    <StoreProvider store={store}>
      <div
        style={
          {
            "--primary": store.primaryColor,
          } as React.CSSProperties
        }
      >
        {!hideHeader && <HeaderOne />}

        {children}

        <Footer />
        <ScrollToTop />
        <Toaster position="top-center" duration={2000} />
      </div>
    </StoreProvider>
  );
}