"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiUrl } from "@/lib/api";
import { getToken } from "@/helper/tokenHelper";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    axios
      .get(apiUrl("/api/v1/public/categories"), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        const data = res.data?.data;
        setCategories(Array.isArray(data) ? data : data?.items ?? []);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="Categories" />
      <ComponentCard title="Categories (read-only)">
        {loading ? (
          <p className="py-6 text-center text-gray-500">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories.map((c: any) => (
                  <tr key={c._id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{c.name ?? c.title}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.slug ?? "—"}</td>
                    <td className="px-4 py-3">{c.isActive !== false ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && categories.length === 0 && (
              <p className="py-6 text-center text-gray-500">No categories found.</p>
            )}
          </div>
        )}
      </ComponentCard>
    </div>
  );
}
