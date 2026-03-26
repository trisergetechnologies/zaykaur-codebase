import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";
import type { ApiProduct } from "../types/api";
import { apiProductToDisplay, type ProductDisplay } from "../lib/productHelpers";

interface ProductsResponse {
  items: ApiProduct[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export function useProducts(params?: {
  page?: number;
  category?: string;
  limit?: number;
  search?: string;
}) {
  const [data, setData] = useState<ProductDisplay[]>([]);
  const [pagination, setPagination] = useState<ProductsResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const q: Record<string, string | number | undefined> = {
      page: params?.page ?? 1,
      limit: params?.limit ?? 24,
    };
    if (params?.category) q.category = params.category;
    if (params?.search && params.search.trim()) q.search = params.search.trim();
    const res = await api.get<ProductsResponse>("/public/products", q);
    setLoading(false);
    if (!res.success || !res.data) {
      setError(res.message);
      setData([]);
      return;
    }
    const d = res.data as ProductsResponse;
    setData(Array.isArray(d.items) ? d.items.map(apiProductToDisplay) : []);
    if (d.pagination) setPagination(d.pagination);
  }, [params?.page, params?.category, params?.limit, params?.search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { data, pagination, loading, error, refetch: fetchProducts };
}
