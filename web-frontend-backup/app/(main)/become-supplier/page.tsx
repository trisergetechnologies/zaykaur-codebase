"use client";

import { useEffect } from "react";

const BecomeSupplierPage = () => {
  useEffect(() => {
    const base = (process.env.NEXT_PUBLIC_SELLER_PORTAL_URL || "http://localhost:3001").replace(/\/+$/, "");
    window.location.href = `${base}/signin`;
  }, []);

  return (
    <section className="max-w-screen-xl mx-auto px-4 md:px-6 py-12">
      <p className="text-sm text-gray-600">Redirecting to seller signup...</p>
    </section>
  );
};

export default BecomeSupplierPage;
