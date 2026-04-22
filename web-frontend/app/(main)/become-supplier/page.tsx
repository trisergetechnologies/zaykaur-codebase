"use client";

import { useEffect } from "react";
import { getSellerSignInUrl } from "@/lib/sellerPortal";

const BecomeSupplierPage = () => {
  useEffect(() => {
    window.location.href = getSellerSignInUrl();
  }, []);

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-6 py-12">
      <p className="text-sm text-gray-600">Redirecting to seller signup.......</p>
    </section>
  );
};

export default BecomeSupplierPage;
