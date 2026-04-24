"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/helper/tokenHelper";
import { ProductIdListEditor } from "@/components/admin/homepage/ProductIdListEditor";

type HeroSlide = {
  title: string;
  description: string;
  images: string[];
  button: string;
  discountText: string;
  link: string;
};

type StripItem = { name: string; slug: string; image: string };

type BestDealTile = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  gridClass: string;
  badge: string;
  curatedSlug: string;
  landingTitle: string;
  landingSubtitle: string;
  productIds: string[];
};

type TrendingTile = {
  title: string;
  image: string;
  link: string;
  curatedSlug: string;
  landingTitle: string;
  landingSubtitle: string;
  productIds: string[];
};

type HomepagePayload = {
  featuredProductIds: string[];
  heroSlides: HeroSlide[];
  topCategoryStrip: StripItem[];
  bestDeals: {
    sectionEyebrow: string;
    sectionTitle: string;
    exploreAllLabel: string;
    exploreAllHref: string;
    tiles: BestDealTile[];
  };
  trendingFashion: {
    title: string;
    subtitle: string;
    promo: {
      image: string;
      title: string;
      body: string;
      ctaLabel: string;
      ctaLink: string;
    };
    tiles: TrendingTile[];
  };
};

const emptyPayload = (): HomepagePayload => ({
  featuredProductIds: [],
  heroSlides: [],
  topCategoryStrip: [],
  bestDeals: {
    sectionEyebrow: "",
    sectionTitle: "",
    exploreAllLabel: "Explore All Deals",
    exploreAllHref: "/shop",
    tiles: [],
  },
  trendingFashion: {
    title: "",
    subtitle: "",
    promo: {
      image: "",
      title: "",
      body: "",
      ctaLabel: "",
      ctaLink: "",
    },
    tiles: [],
  },
});

type TabId = "featured" | "hero" | "strip" | "bestDeals" | "trending";

export default function AdminHomepagePage() {
  const [tab, setTab] = useState<TabId>("featured");
  const [data, setData] = useState<HomepagePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchContent = useCallback(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(apiUrl("/api/v1/admin/homepage"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const d = res.data?.data;
        if (d && typeof d === "object") {
          const bestTiles = Array.isArray(d.bestDeals?.tiles)
            ? d.bestDeals.tiles.map((t: Record<string, unknown>) => ({
                title: String(t.title ?? ""),
                subtitle: String(t.subtitle ?? ""),
                image: String(t.image ?? ""),
                link: String(t.link ?? ""),
                gridClass: String(
                  t.gridClass ?? "lg:col-span-1 lg:row-span-1"
                ),
                badge: String(t.badge ?? ""),
                curatedSlug: String(t.curatedSlug ?? ""),
                landingTitle: String(t.landingTitle ?? ""),
                landingSubtitle: String(t.landingSubtitle ?? ""),
                productIds: Array.isArray(t.productIds)
                  ? t.productIds.map((id: unknown) => String(id))
                  : [],
              }))
            : [];
          const trendTiles = Array.isArray(d.trendingFashion?.tiles)
            ? d.trendingFashion.tiles.map((t: Record<string, unknown>) => ({
                title: String(t.title ?? ""),
                image: String(t.image ?? ""),
                link: String(t.link ?? ""),
                curatedSlug: String(t.curatedSlug ?? ""),
                landingTitle: String(t.landingTitle ?? ""),
                landingSubtitle: String(t.landingSubtitle ?? ""),
                productIds: Array.isArray(t.productIds)
                  ? t.productIds.map((id: unknown) => String(id))
                  : [],
              }))
            : [];
          setData({
            featuredProductIds: Array.isArray(d.featuredProductIds)
              ? d.featuredProductIds.map((id: unknown) => String(id))
              : [],
            heroSlides: Array.isArray(d.heroSlides) ? d.heroSlides : [],
            topCategoryStrip: Array.isArray(d.topCategoryStrip)
              ? d.topCategoryStrip
              : [],
            bestDeals: {
              sectionEyebrow: d.bestDeals?.sectionEyebrow ?? "",
              sectionTitle: d.bestDeals?.sectionTitle ?? "",
              exploreAllLabel: d.bestDeals?.exploreAllLabel ?? "Explore All Deals",
              exploreAllHref: d.bestDeals?.exploreAllHref ?? "/shop",
              tiles: bestTiles,
            },
            trendingFashion: {
              title: d.trendingFashion?.title ?? "",
              subtitle: d.trendingFashion?.subtitle ?? "",
              promo: {
                image: d.trendingFashion?.promo?.image ?? "",
                title: d.trendingFashion?.promo?.title ?? "",
                body: d.trendingFashion?.promo?.body ?? "",
                ctaLabel: d.trendingFashion?.promo?.ctaLabel ?? "",
                ctaLink: d.trendingFashion?.promo?.ctaLink ?? "",
              },
              tiles: trendTiles,
            },
          });
        } else {
          setData(emptyPayload());
        }
      })
      .catch(() => {
        toast.error("Failed to load homepage content");
        setData(emptyPayload());
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const save = async () => {
    if (!data) return;
    const token = getToken();
    if (!token) {
      toast.error("Not signed in");
      return;
    }
    const payload: HomepagePayload = {
      ...data,
      featuredProductIds: data.featuredProductIds ?? [],
      heroSlides: data.heroSlides.map((s) => ({
        ...s,
        images: s.images.map((u) => u.trim()).filter(Boolean),
      })),
    };
    for (const slide of payload.heroSlides) {
      if (!slide.images?.length) {
        toast.error("Each hero slide needs at least one image");
        return;
      }
    }
    setSaving(true);
    try {
      const res = await axios.put(apiUrl("/api/v1/admin/homepage"), payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.data?.success) {
        toast.success("Homepage saved");
        if (res.data?.data) {
          const d = res.data.data;
          setData((prev) =>
            prev
              ? {
                  ...prev,
                  ...d,
                  featuredProductIds: Array.isArray(d.featuredProductIds)
                    ? d.featuredProductIds.map((id: unknown) => String(id))
                    : prev.featuredProductIds,
                  heroSlides: d.heroSlides ?? prev.heroSlides,
                  topCategoryStrip: d.topCategoryStrip ?? prev.topCategoryStrip,
                  bestDeals: d.bestDeals ?? prev.bestDeals,
                  trendingFashion: d.trendingFashion ?? prev.trendingFashion,
                }
              : prev
          );
        }
      } else {
        toast.error(res.data?.message || "Save failed");
      }
    } catch (e: unknown) {
      const msg =
        axios.isAxiosError(e) && e.response?.data?.message
          ? String(e.response.data.message)
          : "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "featured", label: "Featured products" },
    { id: "hero", label: "Hero banner" },
    { id: "strip", label: "Top categories" },
    { id: "bestDeals", label: "Best deals" },
    { id: "trending", label: "Trending fashion" },
  ];

  if (loading || !data) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-gray-500">
        Loading homepage content…
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" />
      <PageBreadcrumb pageTitle="Homepage content" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
          Choose what shoppers see on your store homepage: featured products, rotating banners,
          top categories, and promotional tiles. You can send people to a normal shop link, or—if
          you add a short page name and pick products—to a dedicated page for that group. Use full
          picture addresses or site paths such as /strip/saree.png.
        </p>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="shrink-0 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save all"}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200 pb-2 dark:border-gray-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "featured" && (
        <ComponentCard title="Featured products">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Pick up to 30 products in the order you want them to appear. Leave this empty to use
            the store’s usual product list.
          </p>
          <ProductIdListEditor
            ids={data.featuredProductIds ?? []}
            max={30}
            onChange={(next) =>
              setData((d) => (d ? { ...d, featuredProductIds: next } : d))
            }
          />
        </ComponentCard>
      )}

      {tab === "hero" && (
        <div className="space-y-6">
          {data.heroSlides.map((slide, i) => (
            <ComponentCard key={i} title={`Slide ${i + 1}`}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Title
                  </label>
                  <Input
                    value={slide.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              heroSlides: d.heroSlides.map((s, j) =>
                                j === i ? { ...s, title: v } : s
                              ),
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Description
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white"
                    rows={3}
                    value={slide.description}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              heroSlides: d.heroSlides.map((s, j) =>
                                j === i ? { ...s, description: v } : s
                              ),
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Button label
                  </label>
                  <Input
                    value={slide.button}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              heroSlides: d.heroSlides.map((s, j) =>
                                j === i ? { ...s, button: v } : s
                              ),
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Discount / badge text
                  </label>
                  <Input
                    value={slide.discountText}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              heroSlides: d.heroSlides.map((s, j) =>
                                j === i ? { ...s, discountText: v } : s
                              ),
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Button destination
                  </label>
                  <Input
                    value={slide.link}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              heroSlides: d.heroSlides.map((s, j) =>
                                j === i ? { ...s, link: v } : s
                              ),
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                    Images (first one is shown on the banner)
                  </label>
                  {(slide.images.length ? slide.images : [""]).map((img, k) => (
                    <div key={k} className="mb-2 flex gap-2">
                      <Input
                        value={img}
                        onChange={(e) => {
                          const v = e.target.value;
                          setData((d) => {
                            if (!d) return d;
                            const next = [...d.heroSlides];
                            const imgs = [...(next[i].images.length ? next[i].images : [""])];
                            imgs[k] = v;
                            next[i] = { ...next[i], images: imgs };
                            return { ...d, heroSlides: next };
                          });
                        }}
                      />
                      <button
                        type="button"
                        className="rounded border border-gray-300 px-2 text-sm dark:border-gray-600"
                        onClick={() => {
                          setData((d) => {
                            if (!d) return d;
                            const next = [...d.heroSlides];
                            const imgs = [...next[i].images];
                            imgs.splice(k, 1);
                            next[i] = { ...next[i], images: imgs };
                            return { ...d, heroSlides: next };
                          });
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="text-sm text-brand-500 hover:underline"
                    onClick={() => {
                      setData((d) => {
                        if (!d) return d;
                        const next = [...d.heroSlides];
                        next[i] = {
                          ...next[i],
                          images: [...next[i].images, ""],
                        };
                        return { ...d, heroSlides: next };
                      });
                    }}
                  >
                    + Add another image
                  </button>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400"
                  onClick={() => {
                    setData((d) =>
                      d && i > 0
                        ? {
                            ...d,
                            heroSlides: (() => {
                              const a = [...d.heroSlides];
                              [a[i - 1], a[i]] = [a[i], a[i - 1]];
                              return a;
                            })(),
                          }
                        : d
                    );
                  }}
                  disabled={i === 0}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400"
                  onClick={() => {
                    setData((d) =>
                      d && i < d.heroSlides.length - 1
                        ? {
                            ...d,
                            heroSlides: (() => {
                              const a = [...d.heroSlides];
                              [a[i], a[i + 1]] = [a[i + 1], a[i]];
                              return a;
                            })(),
                          }
                        : d
                    );
                  }}
                  disabled={i === data.heroSlides.length - 1}
                >
                  Move down
                </button>
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() => {
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            heroSlides: d.heroSlides.filter((_, j) => j !== i),
                          }
                        : d
                    );
                  }}
                >
                  Remove slide
                </button>
              </div>
            </ComponentCard>
          ))}
          <button
            type="button"
            className="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 dark:border-gray-600"
            onClick={() => {
              setData((d) =>
                d
                  ? {
                      ...d,
                      heroSlides: [
                        ...d.heroSlides,
                        {
                          title: "",
                          description: "",
                          images: [""],
                          button: "Shop Now",
                          discountText: "",
                          link: "/shop",
                        },
                      ],
                    }
                  : d
              );
            }}
          >
            + Add hero slide
          </button>
        </div>
      )}

      {tab === "strip" && (
        <div className="space-y-6">
          {data.topCategoryStrip.map((row, i) => (
            <ComponentCard key={i} title={`Category ${i + 1}`}>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
                  <Input
                    value={row.name}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              topCategoryStrip: d.topCategoryStrip.map((r, j) =>
                                j === i ? { ...r, name: v } : r
                              ),
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Link name
                  </label>
                  <Input
                    value={row.slug}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              topCategoryStrip: d.topCategoryStrip.map((r, j) =>
                                j === i ? { ...r, slug: v } : r
                              ),
                            }
                          : d
                      );
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Short name for the shop link: lowercase, use hyphens instead of spaces (example:
                    ethnic-wear).
                  </p>
                </div>
                <div className="md:col-span-3">
                  <label className="mb-1 block text-xs font-medium text-gray-600">Image</label>
                  <Input
                    value={row.image}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              topCategoryStrip: d.topCategoryStrip.map((r, j) =>
                                j === i ? { ...r, image: v } : r
                              ),
                            }
                          : d
                      );
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-sm text-gray-600"
                  disabled={i === 0}
                  onClick={() => {
                    setData((d) =>
                      d && i > 0
                        ? {
                            ...d,
                            topCategoryStrip: (() => {
                              const a = [...d.topCategoryStrip];
                              [a[i - 1], a[i]] = [a[i], a[i - 1]];
                              return a;
                            })(),
                          }
                        : d
                    );
                  }}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="text-sm text-gray-600"
                  disabled={i === data.topCategoryStrip.length - 1}
                  onClick={() => {
                    setData((d) =>
                      d && i < d.topCategoryStrip.length - 1
                        ? {
                            ...d,
                            topCategoryStrip: (() => {
                              const a = [...d.topCategoryStrip];
                              [a[i], a[i + 1]] = [a[i + 1], a[i]];
                              return a;
                            })(),
                          }
                        : d
                    );
                  }}
                >
                  Move down
                </button>
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            topCategoryStrip: d.topCategoryStrip.filter((_, j) => j !== i),
                          }
                        : d
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </ComponentCard>
          ))}
          <button
            type="button"
            className="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm"
            onClick={() =>
              setData((d) =>
                d
                  ? {
                      ...d,
                      topCategoryStrip: [
                        ...d.topCategoryStrip,
                        { name: "", slug: "", image: "" },
                      ],
                    }
                  : d
              )
            }
          >
            + Add category
          </button>
        </div>
      )}

      {tab === "bestDeals" && (
        <div className="space-y-6">
          <ComponentCard title="Section header">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Small label above title
                </label>
                <Input
                  value={data.bestDeals.sectionEyebrow}
                  onChange={(e) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            bestDeals: { ...d.bestDeals, sectionEyebrow: e.target.value },
                          }
                        : d
                    )
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Title</label>
                <Input
                  value={data.bestDeals.sectionTitle}
                  onChange={(e) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            bestDeals: { ...d.bestDeals, sectionTitle: e.target.value },
                          }
                        : d
                    )
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  “Explore all” label
                </label>
                <Input
                  value={data.bestDeals.exploreAllLabel}
                  onChange={(e) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            bestDeals: { ...d.bestDeals, exploreAllLabel: e.target.value },
                          }
                        : d
                    )
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  “Explore all” link
                </label>
                <Input
                  value={data.bestDeals.exploreAllHref}
                  onChange={(e) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            bestDeals: { ...d.bestDeals, exploreAllHref: e.target.value },
                          }
                        : d
                    )
                  }
                />
              </div>
            </div>
          </ComponentCard>
          {data.bestDeals.tiles.map((tile, i) => (
            <ComponentCard key={i} title={`Tile ${i + 1}`}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Title</label>
                  <Input
                    value={tile.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              bestDeals: {
                                ...d.bestDeals,
                                tiles: d.bestDeals.tiles.map((t, j) =>
                                  j === i ? { ...t, title: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Subtitle</label>
                  <Input
                    value={tile.subtitle}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              bestDeals: {
                                ...d.bestDeals,
                                tiles: d.bestDeals.tiles.map((t, j) =>
                                  j === i ? { ...t, subtitle: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">Image</label>
                  <Input
                    value={tile.image}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              bestDeals: {
                                ...d.bestDeals,
                                tiles: d.bestDeals.tiles.map((t, j) =>
                                  j === i ? { ...t, image: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Where the tile goes
                  </label>
                  <Input
                    value={tile.link}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              bestDeals: {
                                ...d.bestDeals,
                                tiles: d.bestDeals.tiles.map((t, j) =>
                                  j === i ? { ...t, link: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If you add a collection name and products below, shoppers open that collection
                    page instead of this link.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Collection page name
                  </label>
                  <Input
                    value={tile.curatedSlug}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              bestDeals: {
                                ...d.bestDeals,
                                tiles: d.bestDeals.tiles.map((t, j) =>
                                  j === i ? { ...t, curatedSlug: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                    hint="Lowercase letters and hyphens only. Must be different for each tile. Example: summer-sale"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Big heading on collection page (optional)
                  </label>
                  <Input
                    value={tile.landingTitle}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              bestDeals: {
                                ...d.bestDeals,
                                tiles: d.bestDeals.tiles.map((t, j) =>
                                  j === i ? { ...t, landingTitle: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Supporting text on collection page (optional)
                  </label>
                  <Input
                    value={tile.landingSubtitle}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              bestDeals: {
                                ...d.bestDeals,
                                tiles: d.bestDeals.tiles.map((t, j) =>
                                  j === i ? { ...t, landingSubtitle: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <ProductIdListEditor
                  ids={tile.productIds ?? []}
                  max={48}
                  title="Products to show on that page"
                  onChange={(next) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            bestDeals: {
                              ...d.bestDeals,
                              tiles: d.bestDeals.tiles.map((t, j) =>
                                j === i ? { ...t, productIds: next } : t
                              ),
                            },
                          }
                        : d
                    )
                  }
                />
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Tile size on large screens (optional)
                  </label>
                  <Input
                    value={tile.gridClass}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              bestDeals: {
                                ...d.bestDeals,
                                tiles: d.bestDeals.tiles.map((t, j) =>
                                  j === i ? { ...t, gridClass: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                    hint="Leave the default unless you were given a custom layout code. Example for a large tile: lg:col-span-2 lg:row-span-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Badge (optional)</label>
                  <Input
                    value={tile.badge}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              bestDeals: {
                                ...d.bestDeals,
                                tiles: d.bestDeals.tiles.map((t, j) =>
                                  j === i ? { ...t, badge: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-sm text-gray-600"
                  disabled={i === 0}
                  onClick={() =>
                    setData((d) =>
                      d && i > 0
                        ? {
                            ...d,
                            bestDeals: {
                              ...d.bestDeals,
                              tiles: (() => {
                                const a = [...d.bestDeals.tiles];
                                [a[i - 1], a[i]] = [a[i], a[i - 1]];
                                return a;
                              })(),
                            },
                          }
                        : d
                    )
                  }
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="text-sm text-gray-600"
                  disabled={i === data.bestDeals.tiles.length - 1}
                  onClick={() =>
                    setData((d) =>
                      d && i < d.bestDeals.tiles.length - 1
                        ? {
                            ...d,
                            bestDeals: {
                              ...d.bestDeals,
                              tiles: (() => {
                                const a = [...d.bestDeals.tiles];
                                [a[i], a[i + 1]] = [a[i + 1], a[i]];
                                return a;
                              })(),
                            },
                          }
                        : d
                    )
                  }
                >
                  Move down
                </button>
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            bestDeals: {
                              ...d.bestDeals,
                              tiles: d.bestDeals.tiles.filter((_, j) => j !== i),
                            },
                          }
                        : d
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </ComponentCard>
          ))}
          <button
            type="button"
            className="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm"
            onClick={() =>
              setData((d) =>
                d
                  ? {
                      ...d,
                      bestDeals: {
                        ...d.bestDeals,
                        tiles: [
                          ...d.bestDeals.tiles,
                          {
                            title: "",
                            subtitle: "",
                            image: "",
                            link: "/shop",
                            gridClass: "lg:col-span-1 lg:row-span-1",
                            badge: "",
                            curatedSlug: "",
                            landingTitle: "",
                            landingSubtitle: "",
                            productIds: [],
                          },
                        ],
                      },
                    }
                  : d
              )
            }
          >
            + Add tile
          </button>
        </div>
      )}

      {tab === "trending" && (
        <div className="space-y-6">
          <ComponentCard title="Section header">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-600">Title</label>
                <Input
                  value={data.trendingFashion.title}
                  onChange={(e) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            trendingFashion: {
                              ...d.trendingFashion,
                              title: e.target.value,
                            },
                          }
                        : d
                    )
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-600">Subtitle</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white"
                  rows={2}
                  value={data.trendingFashion.subtitle}
                  onChange={(e) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            trendingFashion: {
                              ...d.trendingFashion,
                              subtitle: e.target.value,
                            },
                          }
                        : d
                    )
                  }
                />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Left promo block">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-600">Background image</label>
                <Input
                  value={data.trendingFashion.promo.image}
                  onChange={(e) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            trendingFashion: {
                              ...d.trendingFashion,
                              promo: { ...d.trendingFashion.promo, image: e.target.value },
                            },
                          }
                        : d
                    )
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Heading</label>
                <Input
                  value={data.trendingFashion.promo.title}
                  onChange={(e) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            trendingFashion: {
                              ...d.trendingFashion,
                              promo: { ...d.trendingFashion.promo, title: e.target.value },
                            },
                          }
                        : d
                    )
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Button text</label>
                <Input
                  value={data.trendingFashion.promo.ctaLabel}
                  onChange={(e) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            trendingFashion: {
                              ...d.trendingFashion,
                              promo: { ...d.trendingFashion.promo, ctaLabel: e.target.value },
                            },
                          }
                        : d
                    )
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-600">Body text</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm dark:border-gray-700 dark:text-white"
                  rows={2}
                  value={data.trendingFashion.promo.body}
                  onChange={(e) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            trendingFashion: {
                              ...d.trendingFashion,
                              promo: { ...d.trendingFashion.promo, body: e.target.value },
                            },
                          }
                        : d
                    )
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Where the button goes (optional)
                </label>
                <Input
                  value={data.trendingFashion.promo.ctaLink}
                  onChange={(e) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            trendingFashion: {
                              ...d.trendingFashion,
                              promo: { ...d.trendingFashion.promo, ctaLink: e.target.value },
                            },
                          }
                        : d
                    )
                  }
                />
              </div>
            </div>
          </ComponentCard>

          {data.trendingFashion.tiles.map((tile, i) => (
            <ComponentCard key={i} title={`Tile ${i + 1}`}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Title</label>
                  <Input
                    value={tile.title}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              trendingFashion: {
                                ...d.trendingFashion,
                                tiles: d.trendingFashion.tiles.map((t, j) =>
                                  j === i ? { ...t, title: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">Image</label>
                  <Input
                    value={tile.image}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              trendingFashion: {
                                ...d.trendingFashion,
                                tiles: d.trendingFashion.tiles.map((t, j) =>
                                  j === i ? { ...t, image: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Where the tile goes
                  </label>
                  <Input
                    value={tile.link}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              trendingFashion: {
                                ...d.trendingFashion,
                                tiles: d.trendingFashion.tiles.map((t, j) =>
                                  j === i ? { ...t, link: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If you add a collection name and products below, shoppers open that collection
                    page instead of this link.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Collection page name
                  </label>
                  <Input
                    value={tile.curatedSlug}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              trendingFashion: {
                                ...d.trendingFashion,
                                tiles: d.trendingFashion.tiles.map((t, j) =>
                                  j === i ? { ...t, curatedSlug: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                    hint="Lowercase letters and hyphens only. Use a different name for each tile. Example: budget-picks"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Big heading on collection page (optional)
                  </label>
                  <Input
                    value={tile.landingTitle}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              trendingFashion: {
                                ...d.trendingFashion,
                                tiles: d.trendingFashion.tiles.map((t, j) =>
                                  j === i ? { ...t, landingTitle: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Supporting text on collection page (optional)
                  </label>
                  <Input
                    value={tile.landingSubtitle}
                    onChange={(e) => {
                      const v = e.target.value;
                      setData((d) =>
                        d
                          ? {
                              ...d,
                              trendingFashion: {
                                ...d.trendingFashion,
                                tiles: d.trendingFashion.tiles.map((t, j) =>
                                  j === i ? { ...t, landingSubtitle: v } : t
                                ),
                              },
                            }
                          : d
                      );
                    }}
                  />
                </div>
                <ProductIdListEditor
                  ids={tile.productIds ?? []}
                  max={48}
                  title="Products to show on that page"
                  onChange={(next) =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            trendingFashion: {
                              ...d.trendingFashion,
                              tiles: d.trendingFashion.tiles.map((t, j) =>
                                j === i ? { ...t, productIds: next } : t
                              ),
                            },
                          }
                        : d
                    )
                  }
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-sm text-gray-600"
                  disabled={i === 0}
                  onClick={() =>
                    setData((d) =>
                      d && i > 0
                        ? {
                            ...d,
                            trendingFashion: {
                              ...d.trendingFashion,
                              tiles: (() => {
                                const a = [...d.trendingFashion.tiles];
                                [a[i - 1], a[i]] = [a[i], a[i - 1]];
                                return a;
                              })(),
                            },
                          }
                        : d
                    )
                  }
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="text-sm text-gray-600"
                  disabled={i === data.trendingFashion.tiles.length - 1}
                  onClick={() =>
                    setData((d) =>
                      d && i < d.trendingFashion.tiles.length - 1
                        ? {
                            ...d,
                            trendingFashion: {
                              ...d.trendingFashion,
                              tiles: (() => {
                                const a = [...d.trendingFashion.tiles];
                                [a[i], a[i + 1]] = [a[i + 1], a[i]];
                                return a;
                              })(),
                            },
                          }
                        : d
                    )
                  }
                >
                  Move down
                </button>
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() =>
                    setData((d) =>
                      d
                        ? {
                            ...d,
                            trendingFashion: {
                              ...d.trendingFashion,
                              tiles: d.trendingFashion.tiles.filter((_, j) => j !== i),
                            },
                          }
                        : d
                    )
                  }
                >
                  Remove
                </button>
              </div>
            </ComponentCard>
          ))}
          <button
            type="button"
            className="rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm"
            onClick={() =>
              setData((d) =>
                d
                  ? {
                      ...d,
                      trendingFashion: {
                        ...d.trendingFashion,
                        tiles: [
                          ...d.trendingFashion.tiles,
                          {
                            title: "",
                            image: "",
                            link: "",
                            curatedSlug: "",
                            landingTitle: "",
                            landingSubtitle: "",
                            productIds: [],
                          },
                        ],
                      },
                    }
                  : d
              )
            }
          >
            + Add tile
          </button>
        </div>
      )}
    </>
  );
}
