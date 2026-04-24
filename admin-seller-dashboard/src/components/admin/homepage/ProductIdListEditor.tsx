"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { apiUrl } from "@/lib/api";
import Input from "@/components/form/input/InputField";

type ProductRow = { _id: string; name: string };

export function ProductIdListEditor({
  ids,
  onChange,
  max,
  title,
}: {
  ids: string[] | undefined | null;
  onChange: (next: string[]) => void;
  max: number;
  title?: string;
}) {
  const list = Array.isArray(ids) ? ids : [];

  const [q, setQ] = useState("");
  const [hits, setHits] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const t = setTimeout(() => {
      const term = q.trim();
      if (term.length < 2) {
        setHits([]);
        return;
      }
      setLoading(true);
      axios
        .get(
          apiUrl(
            `/api/v1/public/products?search=${encodeURIComponent(term)}&limit=12`
          )
        )
        .then((res) => {
          const items = res.data?.data?.items;
          if (Array.isArray(items)) {
            setHits(
              items.map((p: { _id?: string; name?: string }) => ({
                _id: String(p._id),
                name: p.name || "—",
              }))
            );
          } else {
            setHits([]);
          }
        })
        .catch(() => setHits([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const add = (id: string, name: string) => {
    if (list.includes(id) || list.length >= max) return;
    onChange([...list, id]);
    setNames((m) => ({ ...m, [id]: name }));
    setQ("");
    setHits([]);
  };

  const remove = (id: string) => {
    onChange(list.filter((x) => x !== id));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const a = [...list];
    [a[idx], a[j]] = [a[j], a[idx]];
    onChange(a);
  };

  return (
    <div className="md:col-span-2 space-y-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      {title ? (
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </p>
      ) : null}
      <div>
        <label className="mb-1 block text-xs text-gray-500">
          Find products
        </label>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Start typing a product name…"
        />
        {loading ? (
          <p className="text-xs text-gray-500 mt-1">Searching…</p>
        ) : null}
        {hits.length > 0 ? (
          <ul className="mt-2 max-h-40 overflow-auto rounded border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
            {hits.map((h) => (
              <li key={h._id}>
                <button
                  type="button"
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
                  onClick={() => add(h._id, h.name)}
                  disabled={list.includes(h._id) || list.length >= max}
                >
                  {h.name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <ul className="space-y-1">
        {list.map((id, idx) => (
          <li
            key={`${id}-${idx}`}
            className="flex items-center gap-2 text-sm flex-wrap"
          >
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              {names[id] || "Saved product"}
            </span>
            <button
              type="button"
              className="text-xs text-gray-600"
              disabled={idx === 0}
              onClick={() => move(idx, -1)}
            >
              Up
            </button>
            <button
              type="button"
              className="text-xs text-gray-600"
              disabled={idx === list.length - 1}
              onClick={() => move(idx, 1)}
            >
              Down
            </button>
            <button
              type="button"
              className="text-xs text-red-600"
              onClick={() => remove(id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-500">
        {list.length} of {max} products
      </p>
    </div>
  );
}
