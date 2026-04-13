"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrderSuccessPage = () => {

  const params = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="bg-white max-w-md w-full p-8 rounded-xl text-center shadow-sm">

        {/* ICON */}
        <div className="flex justify-center mb-6">

          <CheckCircle2
            className="text-green-500 animate-bounce"
            size={72}
          />

        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-semibold mb-2">
          Order Placed Successfully 
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Thank you for your purchase. Your order has been received.
        </p>

        {/* ORDER ID */}
        <div className="bg-gray-100 rounded-lg py-3 mb-6">

          <p className="text-xs text-gray-500">
            Order ID
          </p>

          <p className="font-medium">
            {orderId}
          </p>

        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-3">

          <Link href="/orders">
            <Button className="w-full bg-pink-600 hover:bg-pink-700">
              View Orders
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full">
              Continue Shopping
            </Button>
          </Link>

        </div>

      </div>

    </section>
  );
};

export default OrderSuccessPage;