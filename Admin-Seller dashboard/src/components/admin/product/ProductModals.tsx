"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { Category, Product, Seller } from "./BasicTableOne";
import { getToken } from "@/helper/tokenHelper";

const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/product`;
const CATEGORY_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/category/getcategory`;
const SELLER_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/seller/getsellers`;

// const TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN!;
let TOKEN: any

// ---------- Detail ----------
export function ProductDetail({
  product,
  open,
  onClose,
  onDelete,
  onEdit,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (p: Product) => void;
}) {
  if (!open) return null;

  const handleDelete = async () => {
    TOKEN = getToken();
    await axios.delete(`${API_URL}/deleteproduct/${product._id}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    onDelete(product._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-3xl p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={22} />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold mb-6">{product.title}</h2>

        {/* Images */}
        {product.images?.length > 0 && (
          <div className="flex gap-3 overflow-x-auto mb-6">
            {product?.images?.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={product.title}
                className="w-32 h-32 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
              />
            ))}
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700 dark:text-gray-300">
          <p><span className="font-medium">Category:</span> {product.categoryId?.title}</p>
          <p><span className="font-medium">Seller:</span> {product.sellerId?.name || "Admin"}</p>
          <p><span className="font-medium">Price:</span> ₹{product.price}</p>
          <p><span className="font-medium">Discount:</span> {product.discountPercent}%</p>
          <p><span className="font-medium">Final Price:</span> ₹{product.finalPrice}</p>
          <p><span className="font-medium">Stock:</span> {product.stock}</p>
          <p><span className="font-medium">GST:</span> {product.gst * 100}%</p>
          <p><span className="font-medium">Status:</span>{" "}
            <span className={`px-2 py-1 text-xs rounded ${
              product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </p>
          <p><span className="font-medium">Created By:</span> {product.createdByRole}</p>
          <p><span className="font-medium">Created:</span> {new Date(product.createdAt).toLocaleString()}</p>
          <p><span className="font-medium">Updated:</span> {new Date(product.updatedAt).toLocaleString()}</p>
        </div>

        {/* Variations */}
        {(product as any).variations?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Variations:</p>
            <div className="flex flex-wrap gap-2">
              {(product as any).variations.map((v: any, i: number) => (
                <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">
                  <span className="font-medium">{v.name}:</span> {(v.options || []).join(', ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={() => onEdit(product)}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Shared Form ----------
function ProductForm({
  form,
  setForm,
  categories,
  sellers,
  file,
  setFile,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  form: any;
  setForm: (f: any) => void;
  categories: Category[];
  sellers: Seller[];
  file?: File | null;
  setFile?: (f: File | null) => void;
  onSubmit: (e: any) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl p-8 space-y-6 relative transition-all"
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {submitLabel} Product
        </h2>
        <button
          onClick={onCancel}
          type="button"
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X size={22} />
        </button>
      </div>

      {/* Title */}
      <div className="relative">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder=" "
          className="peer w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 pt-5 pb-2 text-sm bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
        />
        <label className="absolute left-3 top-1.5 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
          Title
        </label>
      </div>

      {/* Description */}
      <div className="relative">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder=" "
          rows={4}
          className="peer w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 pt-5 pb-2 text-sm bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
        />
        <label className="absolute left-3 top-1.5 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
          Description
        </label>
      </div>

      {/* Price / Discount / Stock / GST */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Price", key: "price", type: "number" },
          { label: "Discount %", key: "discountPercent", type: "number" },
          { label: "Stock", key: "stock", type: "number" },
          { label: "GST %", key: "gst", type: "number" },
        ].map((f) => (
          <div key={f.key} className="relative">
            <input
              type={f.type}
              value={form[f.key] ?? 0}
              onChange={(e) => setForm({ ...form, [f.key]: +e.target.value })}
              placeholder=" "
              className="peer w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 pt-5 pb-2 text-sm bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            />
            <label className="absolute left-3 top-1.5 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
              {f.label}
            </label>
          </div>
        ))}
      </div>

      {/* Category / Seller */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-3 text-sm bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
          <label className="absolute left-3 -top-2.5 text-xs text-gray-500 bg-white dark:bg-gray-900 px-1">
            Category
          </label>
        </div>

        <div className="relative">
          <select
            value={form.sellerId}
            onChange={(e) => setForm({ ...form, sellerId: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-3 text-sm bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          >
            <option value="">Select Seller</option>
            {sellers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <label className="absolute left-3 -top-2.5 text-xs text-gray-500 bg-white dark:bg-gray-900 px-1">
            Seller
          </label>
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Status</label>
        <button
          type="button"
          onClick={() => setForm({ ...form, isActive: !form.isActive })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            form.isActive ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              form.isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {form.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Variations */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Variations</label>
          <button
            type="button"
            onClick={() => {
              const variations = form.variations || [];
              setForm({ ...form, variations: [...variations, { name: "", options: "" }] });
            }}
            className="text-xs px-3 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300"
          >
            + Add Variation
          </button>
        </div>
        {(form.variations || []).map((v: any, idx: number) => (
          <div key={idx} className="flex gap-2 mb-2 items-center">
            <input
              placeholder="Name (e.g. Size)"
              value={v.name}
              onChange={(e) => {
                const updated = [...form.variations];
                updated[idx] = { ...updated[idx], name: e.target.value };
                setForm({ ...form, variations: updated });
              }}
              className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent focus:border-indigo-500 outline-none"
            />
            <input
              placeholder="Options (comma separated: S, M, L, XL)"
              value={typeof v.options === 'string' ? v.options : (v.options || []).join(', ')}
              onChange={(e) => {
                const updated = [...form.variations];
                updated[idx] = { ...updated[idx], options: e.target.value };
                setForm({ ...form, variations: updated });
              }}
              className="flex-[2] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent focus:border-indigo-500 outline-none"
            />
            <button
              type="button"
              onClick={() => {
                const updated = form.variations.filter((_: any, i: number) => i !== idx);
                setForm({ ...form, variations: updated });
              }}
              className="text-red-500 hover:text-red-700 text-lg px-1"
            >
              ×
            </button>
          </div>
        ))}
        {(!form.variations || form.variations.length === 0) && (
          <p className="text-xs text-gray-400">No variations added. Product will have no selectable options.</p>
        )}
      </div>

      {/* File Upload */}
      {setFile && (
        <div>
          <label className="text-sm font-medium mb-2 block">Product Image</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-400 transition">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer text-sm text-gray-500">
              {file ? file.name : "Click to upload or drag and drop"}
            </label>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

// ---------- Add ----------
export function ProductAdd({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    price: 0,
    discountPercent: 0,
    stock: 0,
    gst: 5,
    categoryId: "",
    sellerId: "",
    isActive: true,
    variations: [],
  });
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  // fetch categories & sellers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, sellerRes] = await Promise.all([
          axios.get(CATEGORY_URL, { headers: { Authorization: `Bearer ${TOKEN}` } }),
          axios.get(SELLER_URL, { headers: { Authorization: `Bearer ${TOKEN}` } }),
        ]);
        setCategories(catRes.data.data || []);
        setSellers(sellerRes.data.data || []);
      } catch (err) {
        console.error("Error fetching categories/sellers", err);
      }
    };
    if (open) fetchData();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'gst') {
        fd.append(k, String(Number(v) / 100));
      } else if (k === 'variations') {
        const parsed = (v as any[]).map((item: any) => ({
          name: item.name,
          options: typeof item.options === 'string'
            ? item.options.split(',').map((o: string) => o.trim()).filter(Boolean)
            : item.options || []
        })).filter((item: any) => item.name && item.options.length > 0);
        fd.append(k, JSON.stringify(parsed));
      } else {
        fd.append(k, String(v));
      }
    });
    if (file) fd.append("image", file);

    const res = await axios.post<Product>(`${API_URL}/addproduct`, fd, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    onSave(res.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <ProductForm
        form={form}
        setForm={setForm}
        categories={categories}
        sellers={sellers}
        file={file}
        setFile={setFile}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Add"
      />
    </div>
  );
}

// ---------- Update ----------
export function ProductUpdate({
  open,
  product,
  onClose,
  onSave,
}: {
  open: boolean;
  product: Product;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [form, setForm] = useState<any>({
    title: product.title,
    description: product.description,
    price: product.price,
    discountPercent: product.discountPercent,
    stock: product.stock,
    gst: Math.round(product.gst * 100),
    categoryId: product.categoryId?._id || "",
    sellerId: product.sellerId?._id || "",
    isActive: product.isActive,
    variations: ((product as any).variations || []).map((v: any) => ({
      name: v.name || "",
      options: (v.options || []).join(", ")
    })),
  });
  const [file, setFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  // fetch categories & sellers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, sellerRes] = await Promise.all([
          axios.get(CATEGORY_URL, { headers: { Authorization: `Bearer ${TOKEN}` } }),
          axios.get(SELLER_URL, { headers: { Authorization: `Bearer ${TOKEN}` } }),
        ]);
        setCategories(catRes.data.data || []);
        setSellers(sellerRes.data.data || []);
      } catch (err) {
        console.error("Error fetching categories/sellers", err);
      }
    };
    if (open) fetchData();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'gst') {
        fd.append(k, String(Number(v) / 100));
      } else if (k === 'variations') {
        const parsed = (v as any[]).map((item: any) => ({
          name: item.name,
          options: typeof item.options === 'string'
            ? item.options.split(',').map((o: string) => o.trim()).filter(Boolean)
            : item.options || []
        })).filter((item: any) => item.name && item.options.length > 0);
        fd.append(k, JSON.stringify(parsed));
      } else {
        fd.append(k, String(v));
      }
    });
    if (file) fd.append("image", file);

    const res = await axios.put(`${API_URL}/updateproduct/${product._id}`, fd, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    onSave(res.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <ProductForm
        form={form}
        setForm={setForm}
        categories={categories}
        sellers={sellers}
        file={file}
        setFile={setFile}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Update"
      />
    </div>
  );
}
