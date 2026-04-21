"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { getToken } from "@/helper/tokenHelper";
import { apiUrl } from "@/lib/api";
import { uploadFile } from "@/lib/upload";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const TAX_CODES = [
  { code: "GST_5", label: "GST 5%" },
  { code: "GST_12", label: "GST 12%" },
  { code: "GST_18", label: "GST 18%" },
  { code: "GST_28", label: "GST 28%" },
];

interface Category {
  _id: string;
  name: string;
  slug: string;
  variantAttributeTemplates?: { key: string; label: string; suggestedOptions?: string[]; displayOrder?: number }[];
}

interface VariantForm {
  id?: string;
  sku: string;
  price: string;
  mrp: string;
  stock: string;
  imageFiles: File[];
  imagePreviews: string[];
  existingImageUrls: string[];
  attributes: Record<string, string>;
}

interface ProductSpecificationForm {
  key: string;
  value: string;
}

const emptySpecification = (): ProductSpecificationForm => ({
  key: "",
  value: "",
});

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;
  const { user } = useAuth();
  const productListPath = user?.role === "seller" ? "/seller/product" : "/admin/product";
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [taxCode, setTaxCode] = useState("GST_18");
  const [status, setStatus] = useState<"draft" | "active">("draft");
  const [serverListingStatus, setServerListingStatus] = useState<string | null>(null);
  const [moderationNote, setModerationNote] = useState("");
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [shortDescription, setShortDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [specifications, setSpecifications] = useState<ProductSpecificationForm[]>([emptySpecification()]);

  useEffect(() => {
    if (user && user.role !== "seller") {
      router.replace(productListPath);
      return;
    }
    if (!user || !productId) return;
    const token = getToken();
    Promise.all([
      axios.get(apiUrl("/api/v1/public/categories")).then((r) => r.data?.data ?? []),
      token
        ? axios
            .get(apiUrl(`/api/v1/seller/products/${productId}`), {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((r) => r.data?.data)
        : Promise.resolve(null),
    ])
      .then(([catList, product]) => {
        setCategories(Array.isArray(catList) ? catList : []);
        if (!product) {
          setError("Product not found");
          setLoading(false);
          return;
        }
        const catId = (product.category as any)?._id ?? product.category ?? "";
        setCategoryId(catId);
        setName(product.name ?? "");
        setDescription(product.description ?? "");
        setBrand(product.brand ?? "");
        setTaxCode(product.taxCode ?? "GST_18");
        setServerListingStatus(product.status ?? null);
        setModerationNote(typeof product.moderationNote === "string" ? product.moderationNote : "");
        const st = product.status;
        if (st === "active" || st === "pending_approval") {
          setStatus("active");
        } else {
          setStatus("draft");
        }
        setShortDescription(product.productDetails?.shortDescription ?? "");
        setHighlights(
          Array.isArray(product.productDetails?.highlights) && product.productDetails.highlights.length
            ? product.productDetails.highlights
            : [""]
        );
        setSpecifications(
          Array.isArray(product.productDetails?.specifications) && product.productDetails.specifications.length
            ? product.productDetails.specifications.map((spec: any) => ({
                key: String(spec?.key || ""),
                value: String(spec?.value || ""),
              }))
            : [emptySpecification()]
        );
        const vList = (product.variants || []).map((v: any) => ({
          id: v._id,
          sku: v.sku ?? "",
          price: String(v.price ?? ""),
          mrp: String(v.mrp ?? ""),
          stock: String(v.stock ?? ""),
          imageFiles: [] as File[],
          imagePreviews: [] as string[],
          existingImageUrls: Array.isArray(v.images) ? v.images.map((img: any) => img?.url).filter(Boolean) : [],
          attributes: (v.attributes && typeof v.attributes === "object") ? { ...v.attributes } : {},
        }));
        setVariants(vList.length ? vList : [{ sku: "", price: "", mrp: "", stock: "", imageFiles: [], imagePreviews: [], existingImageUrls: [], attributes: {} }]);
        if (catList?.length && !catId) setCategoryId(catList[0]._id);
      })
      .catch(() => setError("Failed to load product"))
      .finally(() => setLoading(false));
  }, [user, productId, router, productListPath]);

  const selectedCategory = categories.find((c) => c._id === categoryId);
  const attributeTemplates = selectedCategory?.variantAttributeTemplates ?? [];

  const addVariant = () => {
    setVariants((v) => [...v, { sku: "", price: "", mrp: "", stock: "", imageFiles: [], imagePreviews: [], existingImageUrls: [], attributes: {} }]);
  };
  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    setVariants((v) => v.filter((_, i) => i !== index));
  };
  const updateVariant = (index: number, field: keyof VariantForm, value: string | number | File | null | Record<string, string>) => {
    setVariants((v) => {
      const next = [...v];
      if (field === "attributes") (next[index] as any).attributes = value;
      else (next[index] as any)[field] = value;
      return next;
    });
  };
  const onVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (files.length > 5) {
      setError("A variant can have maximum 5 images.");
      return;
    }
    if (files.some((file) => !file.type.startsWith("image/"))) {
      setError("Please select only images (JPEG, PNG, WebP, GIF).");
      return;
    }
    updateVariant(index, "imageFiles", files);
    updateVariant(index, "existingImageUrls", []);
    Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    ).then((previews) => updateVariant(index, "imagePreviews", previews));
  };

  const updateHighlight = (index: number, value: string) => {
    setHighlights((prev) => prev.map((item, i) => (i === index ? value : item)));
  };
  const addHighlight = () => setHighlights((prev) => [...prev, ""]);
  const removeHighlight = (index: number) => {
    setHighlights((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const updateSpecification = (index: number, field: "key" | "value", value: string) => {
    setSpecifications((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };
  const addSpecification = () => setSpecifications((prev) => [...prev, emptySpecification()]);
  const removeSpecification = (index: number) => {
    setSpecifications((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = getToken();
    if (!token) {
      setError("Please sign in again.");
      return;
    }
    if (!name.trim() || !description.trim() || !categoryId || !taxCode) {
      setError("Name, description, category and tax code are required.");
      return;
    }
    const normalizedShort = shortDescription.trim();
    if (normalizedShort.length < 20 || normalizedShort.length > 220) {
      setError("Short description must be between 20 and 220 characters.");
      return;
    }
    const normalizedHighlights = highlights.map((h) => h.trim()).filter(Boolean);
    if (!normalizedHighlights.length || normalizedHighlights.length > 10) {
      setError("Please provide between 1 and 10 highlights.");
      return;
    }
    if (normalizedHighlights.some((item) => item.length < 3 || item.length > 120)) {
      setError("Each highlight must be between 3 and 120 characters.");
      return;
    }
    const normalizedSpecifications = specifications
      .map((spec) => ({ key: spec.key.trim(), value: spec.value.trim() }))
      .filter((spec) => spec.key && spec.value);
    if (!normalizedSpecifications.length || normalizedSpecifications.length > 20) {
      setError("Please provide between 1 and 20 specifications.");
      return;
    }
    if (normalizedSpecifications.some((spec) => spec.key.length > 50 || spec.value.length > 200)) {
      setError("Specification key/value length is too long.");
      return;
    }
    const specKeySet = new Set<string>();
    for (const spec of normalizedSpecifications) {
      const key = spec.key.toLowerCase();
      if (specKeySet.has(key)) {
        setError(`Duplicate specification key: ${spec.key}`);
        return;
      }
      specKeySet.add(key);
    }
    const validVariants = variants.filter((v) => v.sku.trim() && v.price.trim() && v.stock.trim());
    if (!validVariants.length) {
      setError("At least one variant with SKU, price and stock is required.");
      return;
    }
    const needImage = validVariants.every(
      (v) => v.imageFiles.length > 0 || v.existingImageUrls.length > 0 || v.imagePreviews.length > 0
    );
    if (!needImage) {
      setError("Each variant must have at least one image (existing or new upload).");
      return;
    }
    setSaving(true);
    try {
      const variantPayloads = await Promise.all(
        validVariants.map(async (v) => {
          let imageUrls = v.existingImageUrls;
          if (v.imageFiles.length > 0) {
            imageUrls = await Promise.all(v.imageFiles.map((file) => uploadFile(file, "products")));
          }
          const attributes: Record<string, string> = { ...v.attributes };
          attributeTemplates.forEach((t) => {
            const val = attributes[t.key] ?? "";
            if (val !== "") attributes[t.key] = val;
          });
          const price = Number(v.price);
          const stock = Number(v.stock);
          const mrp = v.mrp ? Number(v.mrp) : undefined;
          if (!Number.isFinite(price) || price < 0) {
            throw new Error(`Invalid price for SKU ${v.sku}`);
          }
          if (!Number.isInteger(stock) || stock < 0) {
            throw new Error(`Invalid stock for SKU ${v.sku}`);
          }
          if (mrp != null && (!Number.isFinite(mrp) || mrp < price)) {
            throw new Error(`MRP must be greater than or equal to price for SKU ${v.sku}`);
          }
          return {
            ...(v.id && { _id: v.id }),
            sku: v.sku.trim(),
            attributes,
            price,
            mrp,
            stock,
            images: imageUrls.map((url, idx) => ({ url, alt: `${v.sku || "Product"} ${idx + 1}` })),
            isActive: true,
          };
        })
      );
      const payload = {
        name: name.trim(),
        description: description.trim(),
        productDetails: {
          shortDescription: normalizedShort,
          highlights: normalizedHighlights,
          specifications: normalizedSpecifications,
        },
        category: categoryId,
        categories: [categoryId],
        brand: brand.trim(),
        taxCode,
        status,
        variantAttributeDefs: attributeTemplates.map((t) => ({
          key: t.key,
          label: t.label,
          options: t.suggestedOptions ?? [],
          displayOrder: t.displayOrder ?? 0,
        })),
        variants: variantPayloads,
      };
      const res = await axios.put(apiUrl(`/api/v1/seller/products/${productId}`), payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.data?.success) {
        router.push(productListPath);
        return;
      }
      setError((res.data && typeof res.data.message === "string" ? res.data.message : null) || "Failed to update product.");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== "seller") return null;
  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit product" />
        <p className="py-6 text-gray-500">Loading...</p>
      </div>
    );
  }
  if (error && !name) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Edit product" />
        <p className="py-6 text-red-600">{error}</p>
        <Link href={productListPath} className="text-indigo-600 hover:underline">Back to products</Link>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Edit product" />
      <div className="mb-4">
        <Link href={productListPath} className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600">
          <ArrowLeft size={18} /> Back to Products
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">{error}</div>
        )}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Basic details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" required maxLength={150} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Short description * (20-220 chars)
            </label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              minLength={20}
              maxLength={220}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" required>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax code *</label>
              <select value={taxCode} onChange={(e) => setTaxCode(e.target.value)} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm" required>
                {TAX_CODES.map((t) => (
                  <option key={t.code} value={t.code}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Listing</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "active")}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="active">Submit for approval</option>
              </select>
              {serverListingStatus === "pending_approval" && (
                <p className="mt-1.5 text-xs text-amber-800 dark:text-amber-200">
                  Awaiting admin review. Choose Draft to withdraw from the approval queue.
                </p>
              )}
              {serverListingStatus === "rejected" && moderationNote && (
                <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                  <span className="font-medium">Admin feedback: </span>
                  {moderationNote}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Structured product details</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Highlights * (1-10)</label>
              <button type="button" onClick={addHighlight} className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                <Plus size={16} /> Add highlight
              </button>
            </div>
            {highlights.map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <input type="text" value={item} onChange={(e) => updateHighlight(index, e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm" maxLength={120} />
                {highlights.length > 1 && (
                  <button type="button" onClick={() => removeHighlight(index)} className="text-red-600 p-1"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specifications * (1-20)</label>
              <button type="button" onClick={addSpecification} className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                <Plus size={16} /> Add specification
              </button>
            </div>
            {specifications.map((spec, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                <input type="text" value={spec.key} onChange={(e) => updateSpecification(index, "key", e.target.value)} className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm" placeholder="Specification name" maxLength={50} />
                <input type="text" value={spec.value} onChange={(e) => updateSpecification(index, "value", e.target.value)} className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm" placeholder="Specification value" maxLength={200} />
                {specifications.length > 1 && (
                  <button type="button" onClick={() => removeSpecification(index)} className="text-red-600 p-1"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Variants</h3>
            <button type="button" onClick={addVariant} className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              <Plus size={16} /> Add variant
            </button>
          </div>
          {variants.map((v, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Variant {index + 1}</span>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(index)} className="text-red-600 hover:text-red-700 p-1"><Trash2 size={18} /></button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">SKU *</label>
                  <input type="text" value={v.sku} onChange={(e) => updateVariant(index, "sku", e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Price (₹) *</label>
                  <input type="number" min={0} step={0.01} value={v.price} onChange={(e) => updateVariant(index, "price", e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">MRP (₹)</label>
                  <input type="number" min={0} step={0.01} value={v.mrp} onChange={(e) => updateVariant(index, "mrp", e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Stock *</label>
                  <input type="number" min={0} value={v.stock} onChange={(e) => updateVariant(index, "stock", e.target.value)} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm" required />
                </div>
              </div>
              {attributeTemplates.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attributeTemplates.map((t) => (
                    <div key={t.key}>
                      <label className="block text-xs text-gray-500 mb-1">{t.label}</label>
                      <input type="text" value={v.attributes[t.key] ?? ""} onChange={(e) => updateVariant(index, "attributes", { ...v.attributes, [t.key]: e.target.value })} className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1.5 text-sm" />
                    </div>
                  ))}
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Images (keep existing or upload new, max 5)</label>
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => onVariantImageChange(index, e)} className="w-full text-sm text-gray-600 dark:text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700" />
                {(v.imagePreviews.length > 0 || v.existingImageUrls.length > 0) && (
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {(v.imagePreviews.length > 0 ? v.imagePreviews : v.existingImageUrls).map((img, i) => (
                      <img key={i} src={img} alt={`Variant ${i + 1}`} className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? "Saving…" : "Update product"}
          </button>
          <Link href={productListPath} className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
