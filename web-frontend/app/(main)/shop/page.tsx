"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2, SlidersHorizontal, X, LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGet } from "@/lib/api";
import { normalizeProducts } from "@/lib/normalizeProduct";
import { productsData } from "@/data/products/productsData";
import { Product } from "@/types";
import SingleProductCartView from "@/components/product/SingleProductCartView";
import SingleProductListView from "@/components/product/SingleProductListView";

const SORT_OPTIONS = [
  { value: "latest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<{ _id: string; name: string; slug: string }[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "latest";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentMin = searchParams.get("min") || "";
  const currentMax = searchParams.get("max") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentSearch = searchParams.get("search") || "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== "page") params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const removeParams = useCallback(
    (...keys: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      keys.forEach((k) => params.delete(k));
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const clearFilters = () => {
    router.push(pathname);
  };

  const [localMin, setLocalMin] = useState(currentMin);
  const [localMax, setLocalMax] = useState(currentMax);
  const priceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setLocalMin(currentMin); }, [currentMin]);
  useEffect(() => { setLocalMax(currentMax); }, [currentMax]);

  const handlePriceChange = useCallback(
    (key: "min" | "max", value: string) => {
      if (key === "min") setLocalMin(value);
      else setLocalMax(value);
      if (priceTimer.current) clearTimeout(priceTimer.current);
      priceTimer.current = setTimeout(() => { updateParam(key, value); }, 500);
    },
    [updateParam]
  );

  useEffect(() => {
    apiGet<any>("/api/v1/public/categories")
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "20");
    params.set("page", String(currentPage));
    if (currentCategory) params.set("category", currentCategory);
    if (currentSort) params.set("sort", currentSort);
    if (currentMin) params.set("minPrice", currentMin);
    if (currentMax) params.set("maxPrice", currentMax);
    if (currentBrand) params.set("brand", currentBrand);
    if (currentSearch) params.set("search", currentSearch);

    apiGet<{ items: any[]; pagination: any }>(`/api/v1/public/products?${params.toString()}`)
      .then((res) => {
        if (res.success && res.data?.items?.length > 0) {
          setProducts(normalizeProducts(res.data.items));
          setTotalPages(res.data.pagination?.totalPages || 1);
          setTotalCount(res.data.pagination?.total || res.data.items.length);
        } else {
          let fallback = productsData as Product[];
          if (currentCategory) {
            fallback = fallback.filter(
              (p) => p.category?.toLowerCase() === currentCategory.toLowerCase()
            );
          }
          if (currentSearch) {
            const q = currentSearch.toLowerCase();
            fallback = fallback.filter(
              (p) => p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
            );
          }
          setProducts(fallback);
          setTotalPages(1);
          setTotalCount(fallback.length);
        }
      })
      .catch(() => {
        setProducts(productsData as Product[]);
        setTotalPages(1);
        setTotalCount(productsData.length);
      })
      .finally(() => setLoading(false));
  }, [currentCategory, currentSort, currentPage, currentMin, currentMax, currentBrand, currentSearch]);

  const hasFilters = !!(currentCategory || currentMin || currentMax || currentBrand || currentSearch);

  const handleCategoryClick = useCallback((slug: string) => {
    updateParam("category", currentCategory === slug ? "" : slug);
    setMobileFilterOpen(false);
  }, [updateParam, currentCategory]);

  const handleBrandClick = useCallback((brand: string) => {
    updateParam("brand", currentBrand === brand ? "" : brand);
    setMobileFilterOpen(false);
  }, [updateParam, currentBrand]);

  const filterSidebar = (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Category</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`block w-full text-left px-3 py-2 text-sm rounded transition ${
                currentCategory === cat.slug
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={localMin}
            onChange={(e) => handlePriceChange("min", e.target.value)}
            className="w-full border rounded px-3 py-2.5 text-sm min-w-0"
          />
          <span className="text-gray-400 shrink-0">-</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={localMax}
            onChange={(e) => handlePriceChange("max", e.target.value)}
            className="w-full border rounded px-3 py-2.5 text-sm min-w-0"
          />
        </div>
      </div>

      {/* Brand */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Brand</h3>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {["Apple", "Samsung", "Sony", "Dell", "boAt", "Priya Textiles", "Rajasthan Silks", "TechMart", "Levis", "IKEA", "Biba", "Boldfit", "LEGO", "Prestige", "Havells", "Dettol", "Tata"].map((b) => (
            <button
              key={b}
              onClick={() => handleBrandClick(b)}
              className={`block w-full text-left px-3 py-2 text-sm rounded transition ${
                currentBrand === b
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={() => { clearFilters(); setMobileFilterOpen(false); }}
          className="w-full py-2.5 border border-gray-300 text-sm font-medium rounded hover:bg-gray-50 transition"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4 sm:mb-6">
        <a href="/" className="hover:text-gray-900">Home</a>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          {currentCategory
            ? categories.find((c) => c.slug === currentCategory)?.name || currentCategory
            : "Shop"}
        </span>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28">{filterSidebar}</div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 zk-premium-surface rounded-3xl border border-slate-100/80 p-4 md:p-6">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>

              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{totalCount}</span> products found
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Sort */}
              <select
                value={currentSort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm bg-white min-w-0 flex-1 sm:flex-none max-w-full sm:max-w-[220px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* View toggle */}
              <div className="hidden sm:flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setView("grid")}
                  className={`p-2 ${view === "grid" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-2 ${view === "list" ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Active filters */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {currentCategory && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                  <button onClick={() => updateParam("category", "")}><X size={12} /></button>
                </span>
              )}
              {currentBrand && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {currentBrand}
                  <button onClick={() => updateParam("brand", "")}><X size={12} /></button>
                </span>
              )}
              {(currentMin || currentMax) && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  ₹{currentMin || "0"} - ₹{currentMax || "∞"}
                  <button onClick={() => removeParams("min", "max")}><X size={12} /></button>
                </span>
              )}
              {currentSearch && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  Search: {currentSearch}
                  <button onClick={() => updateParam("search", "")}><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Products */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-xl font-semibold text-gray-900 mb-2">No products found</p>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition">
                Clear Filters
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {products.map((product) => (
                <SingleProductCartView key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <SingleProductListView key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                disabled={currentPage <= 1}
                onClick={() => updateParam("page", String(currentPage - 1))}
                className="p-2 border rounded-lg disabled:opacity-30 hover:bg-gray-50"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-400">...</span>}
                    <button
                      onClick={() => updateParam("page", String(p))}
                      className={`w-10 h-10 rounded-lg text-sm font-medium ${
                        p === currentPage ? "bg-gray-900 text-white" : "border hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => updateParam("page", String(currentPage + 1))}
                className="p-2 border rounded-lg disabled:opacity-30 hover:bg-gray-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-[320px] bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)}><X size={24} /></button>
            </div>
            <div className="p-4">{filterSidebar}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-32"><Loader2 className="animate-spin text-gray-400" size={32} /></div>}>
      <ShopContent />
    </Suspense>
  );
}
