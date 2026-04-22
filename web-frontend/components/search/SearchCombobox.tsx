"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { topCategories } from "@/data/category/topCategories";
import { useProductSearchSuggestions } from "@/hooks/useProductSearchSuggestions";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const MIN_QUERY = 2;
const POPULAR_TERMS = ["Saree", "Kurti", "Lehenga", "Jewellery"];

export type SearchComboboxVariant = "header" | "mobile";

type NavOption =
  | { kind: "chip"; key: string; label: string; href: string }
  | { kind: "product"; key: string; product: Product };

function productHref(p: Product) {
  const id = p._id ?? p.id;
  return `/shop/product/${id}`;
}

type Props = {
  variant?: SearchComboboxVariant;
  onAfterNavigate?: () => void;
  autoFocus?: boolean;
};

const SearchCombobox = ({
  variant = "header",
  onAfterNavigate,
  autoFocus = false,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = searchTerm.trim();
  const suggestEnabled = panelOpen && trimmed.length >= MIN_QUERY;
  const { items: suggestions, loading } = useProductSearchSuggestions(searchTerm, {
    enabled: suggestEnabled,
    minLength: MIN_QUERY,
    limit: 8,
  });

  useEffect(() => {
    const q = searchParams.get("query") || "";
    if (pathname === "/search") {
      setSearchTerm(q);
    } else if (pathname !== "/search") {
      setSearchTerm("");
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const categoryChips = useMemo(
    () =>
      topCategories.slice(0, 6).map((c) => ({
        kind: "chip" as const,
        key: `cat-${c.slug}`,
        label: c.label,
        href: `/shop?category=${encodeURIComponent(c.slug)}`,
      })),
    []
  );

  const popularChips = useMemo(
    () =>
      POPULAR_TERMS.map((t) => ({
        kind: "chip" as const,
        key: `pop-${t}`,
        label: t,
        href: `/search?query=${encodeURIComponent(t)}`,
      })),
    []
  );

  const navOptions: NavOption[] = useMemo(() => {
    if (trimmed.length >= MIN_QUERY) {
      return suggestions.map((p) => ({
        kind: "product" as const,
        key: `p-${p._id ?? p.id}`,
        product: p,
      }));
    }
    return [...categoryChips, ...popularChips];
  }, [trimmed.length, suggestions, categoryChips, popularChips]);

  useEffect(() => {
    setHighlight(-1);
  }, [searchTerm, trimmed.length, suggestions.length]);

  const goSearch = useCallback(
    (q: string) => {
      const t = q.trim();
      if (!t) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("query", t);
      router.push(`/search?${params.toString()}`);
      setPanelOpen(false);
      onAfterNavigate?.();
    },
    [router, searchParams, onAfterNavigate]
  );

  const activateOption = useCallback(
    (opt: NavOption | undefined) => {
      if (!opt) return;
      if (opt.kind === "chip") {
        router.push(opt.href);
        setPanelOpen(false);
        onAfterNavigate?.();
        return;
      }
      router.push(productHref(opt.product));
      setPanelOpen(false);
      onAfterNavigate?.();
    },
    [router, onAfterNavigate]
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlight >= 0 && navOptions[highlight]) {
      activateOption(navOptions[highlight]);
      return;
    }
    goSearch(searchTerm);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!panelOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setPanelOpen(true);
    }
    if (e.key === "Escape") {
      setPanelOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!navOptions.length) return;
      setHighlight((h) => (h + 1 >= navOptions.length ? 0 : h + 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!navOptions.length) return;
      setHighlight((h) => (h <= 0 ? navOptions.length - 1 : h - 1));
    }
  };

  const showRecommendations = trimmed.length < MIN_QUERY;
  const listboxId = "search-suggestions-listbox";

  return (
    <div ref={rootRef} className={cn("relative w-full", variant === "mobile" && "px-1")}>
      <form
        role="search"
        onSubmit={onSubmit}
        className={cn(
          "flex h-[42px] w-full items-center rounded-full bg-gray-100 px-4 transition",
          "focus-within:bg-white focus-within:ring-2 focus-within:ring-pink-500",
          variant === "mobile" && "h-11 rounded-xl"
        )}
      >
        <Search size={18} className="mr-3 shrink-0 text-gray-500" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={panelOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            highlight >= 0 ? `search-opt-${highlight}` : undefined
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setPanelOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Try Saree, Kurti, or product name"
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-500"
        />
        {loading && suggestEnabled && (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" aria-hidden />
        )}
      </form>

      {panelOpen && (
        <div
          id={listboxId}
          role="listbox"
          className={cn(
            "absolute left-0 right-0 z-[130] mt-1.5 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-lg",
            variant === "mobile" && "max-h-[min(70vh,420px)] overflow-y-auto"
          )}
        >
          {showRecommendations && (
            <div className="border-b border-stone-100 px-3 py-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-stone-400">
                Try searching
              </p>
              <div className="flex flex-wrap gap-1.5">
                {navOptions.map((opt, idx) => {
                  if (opt.kind !== "chip") return null;
                  return (
                    <Link
                      key={opt.key}
                      id={`search-opt-${idx}`}
                      href={opt.href}
                      role="option"
                      className={cn(
                        "rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700 transition hover:border-stone-300 hover:bg-white",
                        highlight === idx && "border-stone-800 bg-stone-100 ring-1 ring-stone-300"
                      )}
                      onMouseEnter={() => setHighlight(idx)}
                      onClick={() => {
                        setPanelOpen(false);
                        onAfterNavigate?.();
                      }}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {trimmed.length >= MIN_QUERY && (
            <div className="py-1">
              {loading && (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-stone-500">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  Searching…
                </div>
              )}
              {!loading && suggestions.length === 0 && (
                <div className="px-4 py-3 text-sm text-stone-500">
                  No matches — press Enter to search the catalog for{" "}
                  <span className="font-medium text-stone-800">{trimmed}</span>
                </div>
              )}
              {!loading &&
                navOptions.map((opt, i) => {
                  if (opt.kind !== "product") return null;
                  const p = opt.product;
                  const img = p.images?.[0];
                  const active = i === highlight;
                  return (
                    <Link
                      key={opt.key}
                      id={`search-opt-${i}`}
                      href={productHref(p)}
                      role="option"
                      aria-selected={active}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-left text-sm transition",
                        active ? "bg-stone-100" : "hover:bg-stone-50"
                      )}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => {
                        setPanelOpen(false);
                        onAfterNavigate?.();
                      }}
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                        {img ? (
                          <Image
                            src={img}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : null}
                      </div>
                      <span className="line-clamp-2 text-stone-800">{p.name}</span>
                    </Link>
                  );
                })}
            </div>
          )}

          {trimmed.length > 0 && trimmed.length < MIN_QUERY && (
            <p className="border-t border-stone-100 px-4 py-2.5 text-xs text-stone-500">
              Type {MIN_QUERY - trimmed.length} more character
              {MIN_QUERY - trimmed.length === 1 ? "" : "s"} for live suggestions
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchCombobox;
