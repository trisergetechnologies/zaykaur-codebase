"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

type Props = { product: any; selectedVariant?: any };

function descriptionToBullets(text: string): string[] {
  const t = String(text || "").trim();
  if (!t) return [];
  const byNewline = t.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (byNewline.length > 1) return byNewline;
  const bySentence = t.split(/[.!?]+\s+/).map((s) => s.trim()).filter(Boolean);
  return bySentence.length > 1 ? bySentence : [t];
}

const ProductDetailAccordion = ({ product, selectedVariant }: Props) => {
  const [openId, setOpenId] = useState<string>("details");

  const highlights: string[] = Array.isArray(product?.aboutItem) ? product.aboutItem : [];
  const specifications: { key: string; value: string }[] = Array.isArray(product?.specifications)
    ? product.specifications
    : [];
  const descriptionBullets = descriptionToBullets(product?.description || "");

  const variantAttrs: { key: string; value: string }[] = [];
  const defs = product?.variantAttributeDefs ?? [];
  const attrs = selectedVariant?.attributes ?? {};
  if (defs.length > 0 && Object.keys(attrs).length > 0) {
    for (const def of defs) {
      const val = attrs[def.key];
      if (val != null && val !== "") {
        variantAttrs.push({ key: def.label || def.key, value: String(val) });
      }
    }
  }

  const items = [
    {
      id: "details",
      title: "Product details",
      content: (
        <div className="space-y-0 text-sm">
          <div className="space-y-0 border-t border-gray-100">
            {product?.brand && (
              <div className="flex border-b border-gray-100 py-2.5">
                <span className="w-[36%] shrink-0 text-gray-500">Brand</span>
                <span className="font-medium text-gray-900">{product.brand}</span>
              </div>
            )}
            {product?.category && (
              <div className="flex border-b border-gray-100 py-2.5">
                <span className="w-[36%] shrink-0 text-gray-500">Category</span>
                <span className="font-medium text-gray-900">{product.category}</span>
              </div>
            )}
            {variantAttrs.map((va, i) => (
              <div key={`va-${va.key}-${i}`} className="flex border-b border-gray-100 py-2.5">
                <span className="w-[36%] shrink-0 text-gray-500">{va.key}</span>
                <span className="font-medium text-gray-900">{va.value}</span>
              </div>
            ))}
            {product?.color?.length > 0 && variantAttrs.every(v => v.key.toLowerCase() !== "color" && v.key.toLowerCase() !== "colour") && (
              <div className="flex border-b border-gray-100 py-2.5">
                <span className="w-[36%] shrink-0 text-gray-500">Color</span>
                <span className="font-medium text-gray-900">{product.color.join(", ")}</span>
              </div>
            )}
            {specifications.map((spec, i) => (
              <div key={`${spec.key}-${i}`} className="flex border-b border-gray-100 py-2.5">
                <span className="w-[36%] shrink-0 text-gray-500">{spec.key}</span>
                <span className="font-medium text-gray-900">{spec.value}</span>
              </div>
            ))}
          </div>
          {highlights.length > 0 && (
            <ul className="mt-4 space-y-2">
              {highlights.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <Check size={14} className="mt-0.5 shrink-0 text-pink-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    ...(descriptionBullets.length > 0
      ? [
          {
            id: "description",
            title: "Description",
            content: (
              <ul className="list-none space-y-2 text-sm text-gray-700">
                {descriptionBullets.map((line, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-pink-500" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="divide-y divide-gray-200 border border-gray-200 bg-white">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? "" : item.id)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold uppercase tracking-wide text-gray-900 hover:bg-gray-50"
            >
              {item.title}
              <ChevronDown
                size={18}
                className={`shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="border-t border-gray-100 px-4 pb-4 pt-2">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductDetailAccordion;
