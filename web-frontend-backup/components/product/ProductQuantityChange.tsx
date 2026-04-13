"use client";

import React from "react";
import { Button } from "../ui/button";
import { Minus, Plus } from "lucide-react";

interface ProductQuantityChangeProps {
  quantity: number;
  setQuantity: (qty: number) => void;
}

const ProductQuantityChange = ({
  quantity,
  setQuantity,
}: ProductQuantityChangeProps) => {
  return (
    <div className="inline-flex items-center border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
      {/* MINUS BUTTON */}
      <Button
        type="button"
        disabled={quantity <= 1}
        onClick={() => setQuantity(quantity - 1)}
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-none hover:bg-gray-50 text-gray-600 disabled:opacity-30 transition-colors"
      >
        <Minus size={14} strokeWidth={3} />
      </Button>

      {/* QUANTITY DISPLAY */}
      <div className="w-12 flex items-center justify-center border-x border-gray-200">
        <span className="text-sm font-bold text-gray-900 select-none">
          {quantity}
        </span>
      </div>

      {/* PLUS BUTTON */}
      <Button
        type="button"
        onClick={() => setQuantity(quantity + 1)}
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-none hover:bg-gray-50 text-gray-600 transition-colors"
      >
        <Plus size={14} strokeWidth={3} />
      </Button>
    </div>
  );
};

export default ProductQuantityChange;