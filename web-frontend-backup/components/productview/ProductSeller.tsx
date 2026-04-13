import { BadgeCheck, Store } from "lucide-react";

interface ProductSellerProps {
  sellerName?: string;
}

const ProductSeller = ({ sellerName }: ProductSellerProps) => {
  const name = sellerName || "ZayKaur Seller";

  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold uppercase tracking-wide text-gray-900">
        Sold By
      </h3>

      <div className="flex items-center gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
          <Store size={20} className="text-pink-600" />
        </div>
        <div className="flex-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            {name}
            <BadgeCheck size={15} className="text-blue-500" />
          </p>
          <p className="text-xs text-gray-500">Verified Seller</p>
        </div>
      </div>
    </div>
  );
};

export default ProductSeller;
