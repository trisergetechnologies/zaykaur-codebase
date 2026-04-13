import { Check } from "lucide-react";

const ProductHighlights = ({ product }: any) => {
  const highlights: string[] = Array.isArray(product?.aboutItem) ? product.aboutItem : [];
  const specifications: { key: string; value: string }[] = Array.isArray(product?.specifications) ? product.specifications : [];

  if (!highlights.length && !specifications.length) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-900">
        Product Details
      </h3>

      {/* key-value style details like Flipkart */}
      <div className="space-y-0 text-sm">
        {product?.brand && (
          <div className="flex border-b border-gray-100 py-2">
            <span className="w-[140px] shrink-0 text-gray-400">Brand</span>
            <span className="text-gray-800">{product.brand}</span>
          </div>
        )}
        {product?.category && (
          <div className="flex border-b border-gray-100 py-2">
            <span className="w-[140px] shrink-0 text-gray-400">Category</span>
            <span className="text-gray-800">{product.category}</span>
          </div>
        )}
        {product?.color?.length > 0 && (
          <div className="flex border-b border-gray-100 py-2">
            <span className="w-[140px] shrink-0 text-gray-400">Color</span>
            <span className="text-gray-800">{product.color.join(", ")}</span>
          </div>
        )}
        {specifications.map((spec: { key: string; value: string }, i: number) => (
          <div key={`${spec.key}-${i}`} className="flex border-b border-gray-100 py-2">
            <span className="w-[140px] shrink-0 text-gray-400">{spec.key}</span>
            <span className="text-gray-800">{spec.value}</span>
          </div>
        ))}
      </div>

      {/* highlights as concise bullet points */}
      {highlights.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {highlights.map((item: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <Check size={13} className="mt-0.5 shrink-0 text-teal-600" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductHighlights;
