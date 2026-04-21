"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiUrl } from "@/lib/api";
import { uploadFile } from "@/lib/upload";
import { getToken } from "@/helper/tokenHelper";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const REQUIRED_DOC_TYPES = ["gstin", "pan", "aadhaar", "passbook", "bank_statement"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDocIndex, setUploadingDocIndex] = useState<number | null>(null);
  const [ownerPhotoLabel, setOwnerPhotoLabel] = useState<string | null>(null);
  const [documentFileLabels, setDocumentFileLabels] = useState<Record<number, string>>({});
  const [form, setForm] = useState({
    shopName: "",
    slug: "",
    description: "",
    ownerPhotoUrl: "",
    gstin: "",
    pan: "",
    aadhaar: "",
    businessAddress: { street: "", city: "", state: "", postalCode: "", country: "India" },
    bankDetails: { accountNumber: "", ifsc: "", bankName: "" },
    bankAccountDetails: "",
    documents: [] as { documentType: string; documentNumber: string; documentUrl: string }[],
  });

  const fetchStatus = useCallback(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(apiUrl("/api/v1/seller/onboarding/me"), {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data?.data;
        if (data && !data.onboardingStatus) data.onboardingStatus = "draft";
        setProfile(data);
        if (data && data.shopName) {
          setForm((f) => ({
            ...f,
            shopName: data.shopName ?? "",
            slug: data.slug ?? "",
            description: data.description ?? "",
            ownerPhotoUrl: data.ownerPhotoUrl ?? "",
            gstin: data.gstin ?? "",
            pan: data.pan ?? "",
            aadhaar: data.aadhaar ?? "",
            businessAddress: {
              street: data.businessAddress?.street ?? "",
              city: data.businessAddress?.city ?? "",
              state: data.businessAddress?.state ?? "",
              postalCode: data.businessAddress?.postalCode ?? "",
              country: data.businessAddress?.country ?? "India",
            },
            bankDetails: {
              accountNumber: data.bankDetails?.accountNumber ?? "",
              ifsc: data.bankDetails?.ifsc ?? "",
              bankName: data.bankDetails?.bankName ?? "",
            },
            bankAccountDetails: data.bankAccountDetails ?? "",
            documents: (data.documents && data.documents.length) ? data.documents.map((d: any) => ({
              documentType: d.documentType ?? "",
              documentNumber: d.documentNumber ?? "",
              documentUrl: d.documentUrl ?? "",
            })) : REQUIRED_DOC_TYPES.map((t) => ({ documentType: t, documentNumber: "", documentUrl: "" })),
          }));
        } else {
          setForm((f) => ({
            ...f,
            documents: REQUIRED_DOC_TYPES.map((t) => ({ documentType: t, documentNumber: "", documentUrl: "" })),
          }));
        }
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.role === "customer") {
      router.replace("/admin");
      return;
    }
    fetchStatus();
  }, [user?.role, router, fetchStatus]);

  const saveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    if (!form.shopName.trim()) {
      toast.error("Shop name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post(
        apiUrl("/api/v1/seller/onboarding/draft"),
        {
          shopName: form.shopName.trim(),
          slug: form.slug.trim() || undefined,
          description: form.description.trim() || undefined,
          ownerPhotoUrl: form.ownerPhotoUrl || undefined,
          gstin: form.gstin.trim() || undefined,
          pan: form.pan.trim() || undefined,
          aadhaar: form.aadhaar.trim() || undefined,
          businessAddress: form.businessAddress,
          bankDetails: form.bankDetails,
          bankAccountDetails: form.bankAccountDetails.trim() || undefined,
          documents: form.documents.filter((d) => d.documentUrl.trim()),
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        toast.success("Draft saved");
        setProfile(res.data.data);
      } else {
        toast.error(res.data?.message || "Failed to save draft");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  const submitOnboarding = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault?.();
    const token = getToken();
    if (!token) return;
    if (!form.shopName.trim() || !form.gstin.trim() || !form.pan.trim() || !form.aadhaar.trim()) {
      toast.error("Shop name, GSTIN, PAN and Aadhaar are required");
      return;
    }
    if (!form.ownerPhotoUrl.trim()) {
      toast.error("Owner photo is required");
      return;
    }
    if (!form.bankDetails.accountNumber.trim() || !form.bankDetails.ifsc.trim() || !form.bankDetails.bankName.trim()) {
      toast.error("Bank account number, IFSC and bank name are required");
      return;
    }
    const addr = form.businessAddress;
    if (!addr.street?.trim() || !addr.city?.trim() || !addr.state?.trim() || !addr.postalCode?.trim()) {
      toast.error("Complete business address (street, city, state, postal code) is required");
      return;
    }
    const docs = form.documents.filter((d) => d.documentUrl.trim());
    const types = new Set(docs.map((d) => d.documentType.toLowerCase()));
    for (const t of REQUIRED_DOC_TYPES) {
      if (!types.has(t)) {
        toast.error(`Upload required document: ${t.replace(/_/g, " ")}`);
        return;
      }
    }
    setSaving(true);
    try {
      const res = await axios.post(
        apiUrl("/api/v1/seller/onboarding/submit"),
        {
          shopName: form.shopName.trim(),
          slug: form.slug.trim() || form.shopName.trim(),
          description: form.description.trim() || "",
          ownerPhotoUrl: form.ownerPhotoUrl || "",
          gstin: form.gstin.trim(),
          pan: form.pan.trim(),
          aadhaar: form.aadhaar.trim(),
          businessAddress: addr,
          bankDetails: form.bankDetails,
          bankAccountDetails: form.bankAccountDetails.trim(),
          documents: docs,
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      if (res.data?.success) {
        toast.success("Onboarding submitted. Waiting for admin approval.");
        setProfile(res.data.data);
      } else {
        toast.error(res.data?.message || "Failed to submit");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit");
    } finally {
      setSaving(false);
    }
  };

  const uploadDocumentFile = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadingDocIndex(index);
    try {
      const url = await uploadFile(file, "documents");
      setForm((prev) => ({
        ...prev,
        documents: prev.documents.map((doc, i) =>
          i === index ? { ...doc, documentUrl: url } : doc
        ),
      }));
      setDocumentFileLabels((prev) => ({ ...prev, [index]: file.name }));
      toast.success("Document uploaded");
    } catch (err: any) {
      toast.error(err?.message || "Document upload failed");
    } finally {
      setUploadingDocIndex(null);
    }
  };

  const uploadOwnerPhoto = async (file: File | null) => {
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadFile(file, "sellers");
      setForm((prev) => ({ ...prev, ownerPhotoUrl: url }));
      setOwnerPhotoLabel(file.name);
      toast.success("Owner photo uploaded");
    } catch (err: any) {
      toast.error(err?.message || "Owner photo upload failed");
    } finally {
      setSaving(false);
    }
  };

  const canEdit = !profile || profile.onboardingStatus === "draft" || profile.onboardingStatus === "rejected";
  const status = profile?.onboardingStatus ?? "draft";

  if (user?.role === "customer") return null;
  if (loading) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Onboarding" />
        <p className="py-6 text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Seller onboarding" />
      <ComponentCard title="Onboarding status">
        <p className="mb-4">
          Status: <span className="font-semibold capitalize">{status.replace("_", " ")}</span>
          {profile?.reviewNote && (
            <span className="ml-2 text-sm text-gray-500">— {profile.reviewNote}</span>
          )}
        </p>
        {status === "approved" && profile?.isActive && (
          <p className="text-green-600 font-medium">Your seller account is active. You can manage products and orders.</p>
        )}
      </ComponentCard>

      {canEdit && (
        <ComponentCard title={status === "rejected" ? "Update and resubmit" : "Onboarding form"} className="mt-6">
          <form onSubmit={saveDraft} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Shop name *</label>
                <input
                  type="text"
                  value={form.shopName}
                  onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Slug (URL-friendly name)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                  placeholder="my-shop"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/30">
              <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Identity Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">GSTIN *</label>
                  <input type="text" value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">PAN *</label>
                  <input type="text" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Aadhaar *</label>
                  <input type="text" value={form.aadhaar} onChange={(e) => setForm({ ...form, aadhaar: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm transition focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">Owner Photo *</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    onChange={(e) => uploadOwnerPhoto(e.target.files?.[0] || null)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                </div>
              </div>
              {form.ownerPhotoUrl && (
                <p className="mt-2 text-xs text-green-600">
                  {ownerPhotoLabel ? `Uploaded: ${ownerPhotoLabel}` : "Photo uploaded"}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/30">
              <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Business Address</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input type="text" value={form.businessAddress.street} onChange={(e) => setForm({ ...form, businessAddress: { ...form.businessAddress, street: e.target.value } })} placeholder="Street" className="sm:col-span-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                <input type="text" value={form.businessAddress.city} onChange={(e) => setForm({ ...form, businessAddress: { ...form.businessAddress, city: e.target.value } })} placeholder="City" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                <input type="text" value={form.businessAddress.state} onChange={(e) => setForm({ ...form, businessAddress: { ...form.businessAddress, state: e.target.value } })} placeholder="State" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                <input type="text" value={form.businessAddress.postalCode} onChange={(e) => setForm({ ...form, businessAddress: { ...form.businessAddress, postalCode: e.target.value } })} placeholder="Postal code" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
                <input type="text" value={form.businessAddress.country} onChange={(e) => setForm({ ...form, businessAddress: { ...form.businessAddress, country: e.target.value } })} placeholder="Country" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800" />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/30">
              <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Bank Details</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input
                  type="text"
                  value={form.bankDetails.accountNumber}
                  onChange={(e) =>
                    setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: e.target.value } })
                  }
                  placeholder="Account Number"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                />
                <input
                  type="text"
                  value={form.bankDetails.ifsc}
                  onChange={(e) =>
                    setForm({ ...form, bankDetails: { ...form.bankDetails, ifsc: e.target.value } })
                  }
                  placeholder="IFSC"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                />
                <input
                  type="text"
                  value={form.bankDetails.bankName}
                  onChange={(e) =>
                    setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: e.target.value } })
                  }
                  placeholder="Bank Name"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/30">
              <h3 className="mb-1 text-sm font-semibold text-gray-800 dark:text-gray-100">Document Uploads</h3>
              <p className="mb-3 text-xs text-gray-500">
                Upload all five: GSTIN, PAN, Aadhaar, passbook, and bank statement (PDF or images).
              </p>
              <div className="space-y-3">
                {form.documents.map((doc, i) => (
                  <div key={i} className="grid grid-cols-1 gap-2 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800/80 lg:grid-cols-12 lg:items-center">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300 lg:col-span-2">
                      {doc.documentType}
                    </span>
                    <input
                      type="text"
                      value={doc.documentNumber}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          documents: form.documents.map((d, j) =>
                            j === i ? { ...d, documentNumber: e.target.value } : d
                          ),
                        })
                      }
                      placeholder="Document Number"
                      className="lg:col-span-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                    />
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif,application/pdf"
                      onChange={(e) => uploadDocumentFile(i, e.target.files?.[0] || null)}
                      className="lg:col-span-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
                    />
                    <div className="lg:col-span-4 flex items-center text-sm text-gray-600 dark:text-gray-300">
                      {uploadingDocIndex === i ? (
                        <span>Uploading…</span>
                      ) : doc.documentUrl ? (
                        <span className="text-green-600 dark:text-green-400">
                          {documentFileLabels[i] ? `Uploaded: ${documentFileLabels[i]}` : "File uploaded"}
                        </span>
                      ) : (
                        <span className="text-gray-400">No file yet</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-gray-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save draft"}
              </button>
              <button
                type="button"
                onClick={(ev) => submitOnboarding(ev)}
                disabled={saving}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Submitting..." : "Submit for approval (Send to admin)"}
              </button>
            </div>
          </form>
        </ComponentCard>
      )}

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
