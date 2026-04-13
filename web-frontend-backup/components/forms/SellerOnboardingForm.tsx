"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

const SellerOnboardingForm = () => {
  const sellerPortalUrl = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_SELLER_PORTAL_URL || "http://localhost:3001";
    const base = String(raw).trim().replace(/\/+$/, "");
    return `${base}/become-supplier`;
  }, []);

  return (
    <div className="max-w-3xl mx-auto rounded-xl border bg-white p-6">
      <h2 className="text-xl font-semibold mb-2">Become a Supplier</h2>
      <p className="text-sm text-gray-600 mb-5">
        Supplier onboarding has moved to a dedicated seller portal. It uses a separate seller account system and dedicated onboarding workflow.
      </p>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-5">
        <p className="text-sm text-blue-900">
          Open the seller portal and continue on:
        </p>
        <p className="mt-1 text-sm font-medium text-blue-900 break-all">{sellerPortalUrl}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a href={sellerPortalUrl} target="_blank" rel="noopener noreferrer">
          <Button className="inline-flex items-center gap-2">
            Open Seller Portal
            <ExternalLink size={16} />
          </Button>
        </a>
        <Link href={sellerPortalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline self-center">
          Open in new tab
        </Link>
      </div>
    </div>
  );
};

export default SellerOnboardingForm;
