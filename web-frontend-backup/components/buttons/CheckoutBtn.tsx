"use client";

import React from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CheckoutBtnProps {
  className?: string;
  amount?: number;
}

const CheckoutBtn = ({ className, amount }: CheckoutBtnProps) => {
  return (
    <Link href="/checkout" className="block w-full group">
      <motion.div
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        className={cn(
          "relative flex items-center justify-between w-full",
          "bg-black text-white",
          "px-6 py-4 rounded-2xl",
          "transition-all duration-300",
          "shadow-md hover:shadow-lg",
          className
        )}
      >
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <ShieldCheck size={18} className="text-green-400" />
          </div>

          <div className="flex flex-col leading-tight">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
              Secure Checkout
            </span>
            <span className="text-sm font-semibold">
              Proceed to Payment
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {amount !== undefined && (
            <span className="text-base font-semibold">
              ₹{amount.toLocaleString()}
            </span>
          )}

          <div className="h-9 w-9 bg-white text-black rounded-xl flex items-center justify-center transition group-hover:translate-x-1">
            <ArrowRight size={16} />
          </div>
        </div>
      </motion.div>

      {/* Subtle trust line */}
      <p className="text-[11px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
        <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
        SSL Encrypted & 100% Secure
      </p>
    </Link>
  );
};

export default CheckoutBtn;
