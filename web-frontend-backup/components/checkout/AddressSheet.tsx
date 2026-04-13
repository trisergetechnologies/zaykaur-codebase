"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "@/lib/api";
import useAuthStore from "@/store/authStore";

import {
  ArrowLeft,
  Plus,
  MapPin,
  Phone,
  Pencil,
  Trash2,
} from "lucide-react";

type Address = {
  id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  type: "HOME" | "WORK";
  isDefault?: boolean;
  _index?: number;
};

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  onSelect: (address: Address) => void;
}

const defaultAddresses: Address[] = [
  {
    id: 1,
    name: "John Doe",
    phone: "9876543210",
    address: "221B Baker Street",
    city: "London",
    pincode: "110001",
    type: "HOME",
    isDefault: true,
  },
];

function mapApiAddresses(apiAddresses: any[]): Address[] {
  return (apiAddresses ?? []).map((a: any, i: number) => ({
    id: i + 1,
    name: a.fullName || a.name || "",
    phone: a.phone || "",
    address: a.street || a.address || "",
    city: a.city || "",
    pincode: a.postalCode || a.pincode || "",
    type: (a.type || "HOME").toUpperCase() as "HOME" | "WORK",
    isDefault: a.isDefault ?? false,
    _index: i,
  }));
}

const AddressSheet = ({ open, setOpen, onSelect }: Props) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { isAuthenticated } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>(defaultAddresses);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    type: "HOME" as "HOME" | "WORK",
  });

  useEffect(() => {
    if (!open || !isAuthenticated) return;
    apiGet<any>("/api/v1/customer/address")
      .then((res) => {
        if (res.success && res.data) {
          const list = Array.isArray(res.data) ? res.data : res.data.addresses ?? res.data.items ?? [];
          if (list.length > 0) {
            setAddresses(mapApiAddresses(list));
          }
        }
      })
      .catch(() => {});
  }, [open, isAuthenticated]);

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      address: "",
      city: "",
      pincode: "",
      type: "HOME",
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.address) return;

    if (isAuthenticated) {
      const body = {
        fullName: form.name,
        phone: form.phone,
        street: form.address,
        city: form.city,
        state: "",
        postalCode: form.pincode,
        country: "India",
      };

      if (editingId) {
        const addr = addresses.find((a) => a.id === editingId);
        const idx = addr?._index ?? 0;
        await apiPut(`/api/v1/customer/address/${idx}`, body);
      } else {
        await apiPost("/api/v1/customer/address", body);
      }

      const res = await apiGet<any>("/api/v1/customer/address");
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : res.data.addresses ?? res.data.items ?? [];
        setAddresses(mapApiAddresses(list));
      }
    } else {
      if (editingId) {
        setAddresses((prev) =>
          prev.map((a) =>
            a.id === editingId ? { ...a, ...form } : a
          )
        );
      } else {
        const newAddress: Address = {
          id: Date.now(),
          ...form,
        };
        setAddresses((prev) => [...prev, newAddress]);
      }
    }

    resetForm();
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (addr: Address) => {
    setForm(addr);
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (isAuthenticated) {
      const addr = addresses.find((a) => a.id === id);
      const idx = addr?._index ?? 0;
      await apiDelete(`/api/v1/customer/address/${idx}`);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } else {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const setDefault = async (id: number) => {
    if (isAuthenticated) {
      const addr = addresses.find((a) => a.id === id);
      const idx = addr?._index ?? 0;
      await apiPatch(`/api/v1/customer/address/${idx}/default`);
    }
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">

        {/* HEADER */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
          {showForm && (
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="rounded p-1 transition hover:bg-slate-100"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <h2 className="text-lg font-semibold text-slate-900">
            {showForm ? "Add New Address" : "Select Address"}
          </h2>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">

          {!showForm && (
            <>
              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-xl border p-4 transition ${
                      addr.isDefault
                        ? "border-pink-300 bg-pink-50/40"
                        : "border-slate-200 hover:border-pink-300"
                    }`}
                  >
                    <div className="flex justify-between">

                      <div
                        onClick={() => {
                          onSelect(addr);
                          setOpen(false);
                        }}
                        className="cursor-pointer pr-3"
                      >
                        <p className="font-semibold text-slate-900">{addr.name}</p>

                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          <span className="rounded bg-slate-100 px-2 py-0.5">
                            {addr.type}
                          </span>

                          {addr.isDefault && (
                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-emerald-700">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex gap-2 text-sm text-slate-600">
                          <MapPin className="mt-1 h-4 w-4 text-slate-400" />
                          <p>
                            {addr.address}, {addr.city} - {addr.pincode}
                          </p>
                        </div>

                        <div className="mt-2 flex gap-2 text-sm text-slate-500">
                          <Phone className="mt-1 h-4 w-4 text-slate-400" />
                          <p>{addr.phone}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleEdit(addr)}
                          className="text-slate-500 transition hover:text-slate-900"
                          aria-label={`Edit address for ${addr.name}`}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(addr.id)}
                          className="text-red-500 transition hover:text-red-600"
                          aria-label={`Delete address for ${addr.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefault(addr.id)}
                        className="mt-3 text-xs font-medium text-pink-600 hover:text-pink-700"
                      >
                        Set as default
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="flex w-full items-center gap-2 rounded-lg border-2 border-dashed border-slate-300"
                onClick={() => setShowForm(true)}
              >
                <Plus size={16} />
                Add New Address
              </Button>
            </>
          )}

          {showForm && (
            <div className="space-y-4">
              <Input
                placeholder="Full Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <Input
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />

              <Textarea
                placeholder="Flat, House no., Building, Area"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="City"
                  value={form.city}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                />

                <Input
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({ ...form, pincode: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant={form.type === "HOME" ? "default" : "outline"}
                  onClick={() =>
                    setForm({ ...form, type: "HOME" })
                  }
                >
                  Home
                </Button>

                <Button
                  variant={form.type === "WORK" ? "default" : "outline"}
                  onClick={() =>
                    setForm({ ...form, type: "WORK" })
                  }
                >
                  Work
                </Button>
              </div>

              <Button
                className="w-full rounded-lg bg-pink-600 hover:bg-pink-700"
                onClick={handleSave}
              >
                {editingId ? "Update Address" : "Save Address"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddressSheet;
