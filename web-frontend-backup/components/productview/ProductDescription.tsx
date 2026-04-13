/**
 * Legacy / quick-view helper: supports `description` string or `product` object.
 * Main PDP uses ProductDetailAccordion for description bullets.
 */
const ProductDescription = ({
  product,
  description,
}: {
  product?: { description?: string };
  description?: string;
}) => {
  const text = description ?? product?.description ?? "";
  if (!text) return null;
  return (
    <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
      {text}
    </p>
  );
};

export default ProductDescription;
