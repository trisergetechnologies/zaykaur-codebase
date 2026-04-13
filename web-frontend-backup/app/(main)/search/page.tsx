"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BreadcrumbComponent from "@/components/others/Breadcrumb";
import SingleProductCartView from "@/components/product/SingleProductCartView";
import SingleProductListView from "@/components/product/SingleProductListView";
import { productsData } from "@/data/products/productsData";
import { apiGet } from "@/lib/api";
import { normalizeProducts } from "@/lib/normalizeProduct";
import { Product } from "@/types";
import Link from "next/link";

const SearchComponent = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [foundProducts, setFoundProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) {
      setFoundProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    apiGet<{ items: any[] }>(`/api/v1/public/products?search=${encodeURIComponent(query)}&limit=50`)
      .then((res) => {
        if (!cancelled && res.success && res.data?.items?.length > 0) {
          setFoundProducts(normalizeProducts(res.data.items));
        } else if (!cancelled) {
          setFoundProducts(
            productsData.filter((product) =>
              product.name.toLowerCase().includes(query.toLowerCase())
            )
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFoundProducts(
            productsData.filter((product) =>
              product.name.toLowerCase().includes(query.toLowerCase())
            )
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (foundProducts.length === 0) {
    return (
      <div className="text-xl font-medium flex flex-col items-center justify-center h-screen w-full">
        <p className="p-4 text-center">Sorry, no search result found for your query !</p>
        <Link className="p-2 underline text-muted-foreground" href={"/"}>Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 md:p-8 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <BreadcrumbComponent links={["/shop"]} pageText={query} />
        <p className=" capitalize">{foundProducts.length} results found for your search <span className="text-lg font-medium">
        {query}</span></p>
      </div>
      <div className="hidden lg:grid grid-cols-1 gap-6">
        {foundProducts.map((product) => (
          <SingleProductListView key={product.id} product={product}/>
        ))}
      </div>
      <div className="zk-premium-surface rounded-3xl border border-slate-100/80 p-4 lg:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {foundProducts.map((product) => (
            <SingleProductCartView key={product.id} product={product}/>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;
