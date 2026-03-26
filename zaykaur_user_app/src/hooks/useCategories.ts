import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api";

export interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  level?: number;
  parent?: string | null;
  image?: string;
  displayOrder?: number;
}

export function useCategories(params?: { level?: number; parent?: string }) {
  const [data, setData] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await api.get<ApiCategory[]>("/public/categories", {
      level: params?.level ?? 0,
      parent: params?.parent ?? "",
    });
    setLoading(false);
    if (!res.success || !res.data) {
      setError(res.message || "Failed to load categories");
      setData([]);
      return;
    }
    const d = res.data as ApiCategory[];
    setData(Array.isArray(d) ? d : []);
  }, [params?.level, params?.parent]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { data, loading, error, refetch: fetchCategories };
}
