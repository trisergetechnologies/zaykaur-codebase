"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "./Pagination";
import { getToken } from "@/helper/tokenHelper";
import { apiUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Plus } from "lucide-react";

export interface Product {
  _id: string;
  name?: string;
  title?: string;
  slug?: string;
  status?: string;
  variants?: { price?: number }[];
  category?: { name?: string; title?: string } | string;
  seller?: { name?: string } | string;
  isActive?: boolean;
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 25;

  const token = getToken();
  const { user } = useAuth();
  const isSeller = user?.role === "seller";
  const productsPath = isSeller ? "/api/v1/seller/products" : "/api/v1/public/products";
  const productBasePath = isSeller ? "/seller/product" : "/admin/product";

  const fetchProducts = useCallback(
    async (pageNum: number = 1) => {
      if (!token && !isSeller) {
        axios
          .get(apiUrl("/api/v1/public/products"), {
            params: { page: pageNum, limit, ...(search.trim() && { search: search.trim() }) },
          })
          .then((res) => {
            const d = res.data?.data;
            const list = d?.items ?? (Array.isArray(d) ? d : []);
            setProducts(list);
            const p = d?.pagination;
            setTotalPages(p?.totalPages ?? 1);
          })
          .catch(() => setProducts([]))
          .finally(() => setLoading(false));
        return;
      }
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page: pageNum, limit };
        if (search.trim()) params.search = search.trim();
        const res = await axios.get(apiUrl(productsPath), {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        const d = res.data?.data;
        const list = d?.items ?? (Array.isArray(d) ? d : []);
        setProducts(list);
        const p = d?.pagination;
        setTotalPages(p?.totalPages ?? 1);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [token, productsPath, search, isSeller]
  );

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  const handleSearchApply = () => {
    setPage(1);
    fetchProducts(1);
  };

  const displayName = (p: Product) => p.name ?? p.title ?? "—";
  const displayPrice = (p: Product) => {
    const v = p.variants?.[0];
    return v?.price != null ? `₹${Number(v.price).toLocaleString("en-IN")}` : "—";
  };
  const displayCategory = (p: Product) =>
    typeof p.category === "object" && p.category
      ? p.category.name ?? p.category.title ?? "—"
      : "—";
  const displayStatus = (p: Product) => p.status ?? (p.isActive ? "active" : "inactive");

  return (
    <div className="premium-card p-4">
      <div className="flex flex-wrap mb-4 gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchApply()}
          placeholder="Search products..."
          className="min-w-[200px] flex-1 rounded-xl border border-white/70 bg-white/90 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
        />
        <button
          onClick={handleSearchApply}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Search
        </button>
        {isSeller && (
          <Link
            href={`${productBasePath}/add`}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus size={18} /> Add product
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/70 dark:border-gray-700">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-left">
              <TableCell isHeader className="px-6 py-3 font-semibold">Product</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold">Category</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold text-right">Price</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold text-center">Status</TableCell>
              {isSeller && <TableCell isHeader className="px-6 py-3 font-semibold">Actions</TableCell>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isSeller ? 5 : 4} className="text-center py-8">
                  Loading…
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow
                  key={p._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <TableCell className="px-6 py-4">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {displayName(p)}
                    </span>
                    {p.slug && (
                      <span className="block text-xs text-gray-500">{p.slug}</span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {displayCategory(p)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right font-medium">
                    {displayPrice(p)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge
                      size="sm"
                      color={displayStatus(p) === "active" ? "success" : "warning"}
                    >
                      {displayStatus(p)}
                    </Badge>
                  </TableCell>
                  {isSeller && (
                    <TableCell className="px-6 py-4">
                      <Link
                        href={`${productBasePath}/edit/${p._id}`}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </Link>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
