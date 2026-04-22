import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { normalizeProducts } from "@/lib/normalizeProduct";
import { Product } from "@/types";
import { useDebouncedValue } from "./useDebouncedValue";

const DEBOUNCE_MS = 250;

export function useProductSearchSuggestions(
  searchTerm: string,
  options?: { minLength?: number; limit?: number; enabled?: boolean }
) {
  const minLength = options?.minLength ?? 2;
  const limit = options?.limit ?? 8;
  const enabled = options?.enabled ?? true;

  const debounced = useDebouncedValue(searchTerm.trim(), DEBOUNCE_MS);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || debounced.length < minLength) {
      setItems([]);
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    setLoading(true);

    apiGet<{ items: unknown[] }>(
      `/api/v1/public/products?search=${encodeURIComponent(debounced)}&limit=${limit}`,
      { signal: ac.signal }
    )
      .then((res) => {
        if (res.success && res.data?.items?.length) {
          setItems(normalizeProducts(res.data.items));
        } else {
          setItems([]);
        }
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setItems([]);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [debounced, enabled, minLength, limit]);

  return { items, loading, debouncedQuery: debounced };
}
