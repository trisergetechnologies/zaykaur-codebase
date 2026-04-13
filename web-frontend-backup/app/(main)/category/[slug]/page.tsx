"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ChevronRight } from "lucide-react";
import { apiGet } from "@/lib/api";
import { normalizeProducts } from "@/lib/normalizeProduct";
import { Product } from "@/types";
import SingleProductCartView from "@/components/product/SingleProductCartView";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  level?: number;
  parent?: string | null;
}

const PLACEHOLDER = "https://picsum.photos/seed/cat-placeholder/300/300";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    Promise.all([
      apiGet<any>("/api/v1/public/categories"),
      apiGet<{ items: any[]; pagination: any }>(`/api/v1/public/products?category=${slug}&limit=24`),
    ])
      .then(([catRes, prodRes]) => {
        if (catRes.success && Array.isArray(catRes.data)) {
          const allCats = catRes.data as Category[];
          const current = allCats.find((c) => c.slug === slug);
          setCategory(current || { _id: "", name: slug, slug });
          if (current) {
            setSubcategories(allCats.filter((c) => c.parent === current._id));
          }
        }
        if (prodRes.success && prodRes.data?.items?.length > 0) {
          setProducts(normalizeProducts(prodRes.data.items));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">Home</Link>
        <ChevronRight size={14} />
        <Link href="/category" className="hover:text-gray-900">Categories</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">{category?.name}</span>
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category?.name}</h1>
        {category?.description && (
          <p className="text-gray-500 mt-1">{category.description}</p>
        )}
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subcategories</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {subcategories.map((sub) => (
              <Link
                key={sub._id}
                href={`/shop?category=${sub.slug}`}
                className="group flex flex-col items-center min-w-[120px]"
              >
                <div className="relative w-24 h-24 rounded-full bg-gray-50 border border-gray-100 overflow-hidden group-hover:shadow-md transition">
                  <Image
                    src={sub.image || PLACEHOLDER}
                    alt={sub.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="mt-2 text-xs font-medium text-gray-700 group-hover:text-blue-600 text-center">
                  {sub.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {products.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Products in {category?.name}
            </h2>
            <Link
              href={`/shop?category=${slug}`}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="zk-premium-surface rounded-3xl border border-slate-100/80 p-4 md:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
            {products.map((product) => (
              <SingleProductCartView key={product.id} product={product} />
            ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">No products found in this category yet.</p>
          <Link href="/shop" className="text-blue-600 font-medium hover:underline">
            Browse all products
          </Link>
        </div>
      )}
    </div>
  );
}
