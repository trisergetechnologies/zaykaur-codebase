"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";

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

export default function CategoriesIndexPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<any>("/api/v1/public/categories")
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          const roots = res.data.filter((c: Category) => !c.parent && c.level === 0);
          setCategories(roots.length > 0 ? roots : res.data.slice(0, 12));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
        <p className="text-gray-500 mt-1">Browse products by category</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden group-hover:shadow-lg transition-shadow">
                <Image
                  src={cat.image || PLACEHOLDER}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{cat.description}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
