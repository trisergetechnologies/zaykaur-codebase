"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiPost, apiGet } from "@/lib/api";

interface VariantAttributeTemplate {
  key: string;
  label: string;
  suggestedOptions?: string[];
  displayOrder?: number;
}

interface Variant {
  label: string;
  sku: string;
  price: string;
  mrp: string;
  stock: string;
  attributes: Record<string, string>;
}

const emptyVariant = (attributeKeys: string[]): Variant => ({
  label: "",
  sku: "",
  price: "",
  mrp: "",
  stock: "",
  attributes: Object.fromEntries(attributeKeys.map((k) => [k, ""])),
});

const ProductForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    brand: "",
    basePrice: "",
    category: "",
    taxCode: "GST_18",
    aboutItem: "",
  });

  const [variants, setVariants] = useState<Variant[]>([emptyVariant([])]);

  const selectedCategory = categories.find(
    (c) => (c._id || c.id) === form.category
  );
  const attributeTemplates: VariantAttributeTemplate[] = (
    selectedCategory?.variantAttributeTemplates || []
  )
    .filter((t: any) => t?.key)
    .sort(
      (a: any, b: any) =>
        (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
    );

  useEffect(() => {
    apiGet<any>("/api/v1/public/categories").then((res) => {
      if (res.success && res.data) {
        const cats = Array.isArray(res.data) ? res.data : res.data.categories ?? [];
        setCategories(cats);
      }
    });
  }, []);

  useEffect(() => {
    const cat = categories.find((c) => (c._id || c.id) === form.category);
    const templates = (cat?.variantAttributeTemplates || []).filter((t: any) => t?.key);
    const keys = templates.map((t: any) => t.key);
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        attributes: Object.fromEntries(
          keys.map((k: string) => [k, v.attributes?.[k] ?? ""])
        ),
      }))
    );
  }, [form.category, categories]);

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const setVariantField = (idx: number, field: keyof Variant) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    if (field === "attributes") {
      const attrKey = (e.target as HTMLSelectElement).dataset.attrKey;
      if (!attrKey) return;
      setVariants((vs) =>
        vs.map((v, i) =>
          i === idx
            ? { ...v, attributes: { ...v.attributes, [attrKey]: value } }
            : v
        )
      );
    } else {
      setVariants((vs) =>
        vs.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
      );
    }
  };

  const addVariant = () => {
    const keys = attributeTemplates.map((t) => t.key);
    setVariants((vs) => [...vs, emptyVariant(keys)]);
  };
  const removeVariant = (idx: number) =>
    setVariants((vs) => vs.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const keys = attributeTemplates.map((t) => t.key);
    const variantAttributeDefs = attributeTemplates.map((t) => ({
      key: t.key,
      label: t.label,
      options: t.suggestedOptions && t.suggestedOptions.length > 0 ? t.suggestedOptions : [],
      displayOrder: t.displayOrder ?? 0,
    }));

    const body: any = {
      name: form.name,
      description: form.description,
      brand: form.brand,
      category: form.category,
      taxCode: form.taxCode,
      aboutItem: form.aboutItem ? form.aboutItem.split("\n").filter(Boolean) : [],
      variantAttributeDefs,
      variants: variants
        .filter((v) => v.sku)
        .map((v) => {
          const attributes: Record<string, string> = {};
          for (const key of keys) {
            const val = v.attributes?.[key];
            if (val != null && val !== "") attributes[key] = val;
          }
          return {
            sku: v.sku,
            price: Number(v.price) || 0,
            mrp: Number(v.mrp) || Number(v.price) || 0,
            stock: Number(v.stock) || 0,
            attributes: keys.length ? attributes : {},
          };
        }),
    };

    if (form.basePrice) body.basePrice = Number(form.basePrice);

    const res = await apiPost("/api/v1/seller/products", body);
    setLoading(false);

    if (res.success) {
      router.push("/dashboard/products");
    } else {
      setError(res.message || "Failed to create product");
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 my-4">
      <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label>Product Name *</Label>
            <Input value={form.name} onChange={setField("name")} required />
          </div>
          <div>
            <Label>Brand *</Label>
            <Input value={form.brand} onChange={setField("brand")} required />
          </div>
          <div>
            <Label>Base Price (₹) *</Label>
            <Input type="number" value={form.basePrice} onChange={setField("basePrice")} required />
          </div>
          <div>
            <Label>Category *</Label>
            <select
              value={form.category}
              onChange={setField("category")}
              required
              className="w-full mt-1 p-2 border rounded-md dark:bg-slate-950 dark:border-gray-600"
            >
              <option value="">Select category</option>
              {categories.map((cat: any) => (
                <option key={cat._id || cat.id} value={cat._id || cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Tax Code *</Label>
            <select
              value={form.taxCode}
              onChange={setField("taxCode")}
              required
              className="w-full mt-1 p-2 border rounded-md dark:bg-slate-950 dark:border-gray-600"
            >
              <option value="GST_5">GST 5% (GST_5)</option>
              <option value="GST_12">GST 12% (GST_12)</option>
              <option value="GST_18">GST 18% (GST_18)</option>
              <option value="GST_28">GST 28% (GST_28)</option>
            </select>
          </div>
          <div className="col-span-full">
            <Label>Description *</Label>
            <textarea
              value={form.description}
              onChange={setField("description")}
              required
              className="w-full mt-1 p-2 border rounded-md dark:bg-slate-950 dark:border-gray-600"
              rows={3}
            />
          </div>
          <div className="col-span-full">
            <Label>About Item (one per line)</Label>
            <textarea
              value={form.aboutItem}
              onChange={setField("aboutItem")}
              className="w-full mt-1 p-2 border rounded-md dark:bg-slate-950 dark:border-gray-600"
              rows={3}
              placeholder="Feature 1&#10;Feature 2"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">Variants</h3>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              + Add Variant
            </Button>
          </div>
          {attributeTemplates.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              This category requires: {attributeTemplates.map((t) => t.label).join(", ")}. Fill for each variant.
            </p>
          )}
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div
                key={i}
                className="border rounded-md p-3 space-y-3 bg-gray-50 dark:bg-gray-900/50"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 items-end">
                  {attributeTemplates.map((t) => {
                    const options = t.suggestedOptions || [];
                    const hasOptions = options.length > 0;
                    return (
                      <div key={t.key}>
                        <Label className="text-xs">{t.label} *</Label>
                        {hasOptions ? (
                          <select
                            required
                            value={v.attributes?.[t.key] ?? ""}
                            onChange={setVariantField(i, "attributes")}
                            data-attr-key={t.key}
                            className="w-full mt-1 p-2 border rounded-md dark:bg-slate-950 dark:border-gray-600 text-sm"
                          >
                            <option value="">Select {t.label}</option>
                            {options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            required
                            value={v.attributes?.[t.key] ?? ""}
                            onChange={(e) => {
                              const attrKey = t.key;
                              setVariants((vs) =>
                                vs.map((v, idx) =>
                                  idx === i
                                    ? { ...v, attributes: { ...v.attributes, [attrKey]: e.target.value } }
                                    : v
                                )
                              );
                            }}
                            placeholder={t.label}
                            className="mt-1"
                          />
                        )}
                      </div>
                    );
                  })}
                  <div>
                    <Label className="text-xs">SKU *</Label>
                    <Input
                      value={v.sku}
                      onChange={setVariantField(i, "sku")}
                      required
                      placeholder="e.g. SKU001"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Price (₹) *</Label>
                    <Input
                      type="number"
                      value={v.price}
                      onChange={setVariantField(i, "price")}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">MRP (₹)</Label>
                    <Input
                      type="number"
                      value={v.mrp}
                      onChange={setVariantField(i, "mrp")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Stock *</Label>
                    <Input
                      type="number"
                      value={v.stock}
                      onChange={setVariantField(i, "stock")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    {variants.length > 1 ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeVariant(i)}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Label className="text-xs opacity-0">Action</Label>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Label (optional)</Label>
                  <Input
                    value={v.label}
                    onChange={setVariantField(i, "label")}
                    placeholder="e.g. Red / L"
                    className="max-w-[200px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? "Creating..." : "Create Product"}
        </Button>
      </form>
    </div>
  );
};

export default ProductForm;
