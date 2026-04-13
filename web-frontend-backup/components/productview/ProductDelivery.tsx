"use client";

import { useState } from "react";
import { MapPin, Truck, RotateCcw, ShieldCheck } from "lucide-react";

const ProductDelivery = () => {
  const [pincode, setPincode] = useState("");

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold uppercase tracking-wide text-gray-900">
        Delivery Options
      </h3>

      {/* pincode checker */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <MapPin
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter pincode"
            maxLength={6}
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
          />
        </div>
        <button className="rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700">
          Check
        </button>
      </div>

      {/* delivery info rows */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
          <Truck size={20} className="mt-0.5 shrink-0 text-teal-600" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Free Delivery</p>
            <p className="text-xs text-gray-500">Dispatched in 2-4 days</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
          <RotateCcw size={20} className="mt-0.5 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Easy Returns</p>
            <p className="text-xs text-gray-500">7-day return policy</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Genuine Product</p>
            <p className="text-xs text-gray-500">100% authentic</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDelivery;
