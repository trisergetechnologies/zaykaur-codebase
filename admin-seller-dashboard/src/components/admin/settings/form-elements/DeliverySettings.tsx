"use client";
import React, { useEffect, useState } from "react";
import ComponentCard from "../../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
import Button from "@/components/ui/button/Button";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { getToken } from "@/helper/tokenHelper";

const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/settings`;

type DeliveryMode = "always_charge" | "no_charge" | "free_above_amount";

export default function DeliverySettings() {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("no_charge");
  const [deliveryChargeAmount, setDeliveryChargeAmount] = useState(0);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(500);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${API_URL}/getsettings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const s = res.data.data;
          setDeliveryMode(s.deliveryMode || "no_charge");
          setDeliveryChargeAmount(s.deliveryChargeAmount || 0);
          setFreeDeliveryAbove(s.freeDeliveryAbove || 500);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.put(
        `${API_URL}/updatesettings`,
        { deliveryMode, deliveryChargeAmount, freeDeliveryAbove },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Delivery settings updated!");
      } else {
        toast.error(res.data.message || "Failed to update");
      }
    } catch (err) {
      console.error("Update settings error:", err);
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const modeOptions: { value: DeliveryMode; label: string; desc: string }[] = [
    {
      value: "no_charge",
      label: "No Delivery Charge",
      desc: "All orders get free delivery",
    },
    {
      value: "always_charge",
      label: "Charge on Every Order",
      desc: "Fixed delivery charge on all orders",
    },
    {
      value: "free_above_amount",
      label: "Free Above Amount",
      desc: "Free delivery for orders above a threshold, charge below",
    },
  ];

  if (fetching) {
    return (
      <ComponentCard title="Delivery Settings">
        <p className="text-sm text-gray-500">Loading settings...</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Delivery Settings">
      <div className="space-y-6">
        <div>
          <Label>Delivery Mode</Label>
          <div className="space-y-3 mt-2">
            {modeOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  deliveryMode === opt.value
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryMode"
                  value={opt.value}
                  checked={deliveryMode === opt.value}
                  onChange={() => setDeliveryMode(opt.value)}
                  className="mt-1 accent-indigo-600"
                />
                <div>
                  <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {opt.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {(deliveryMode === "always_charge" ||
          deliveryMode === "free_above_amount") && (
          <div>
            <Label>Delivery Charge Amount (₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 50"
              defaultValue={String(deliveryChargeAmount)}
              onChange={(e) =>
                setDeliveryChargeAmount(parseFloat(e.target.value) || 0)
              }
            />
          </div>
        )}

        {deliveryMode === "free_above_amount" && (
          <div>
            <Label>Free Delivery Above (₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 500"
              defaultValue={String(freeDeliveryAbove)}
              onChange={(e) =>
                setFreeDeliveryAbove(parseFloat(e.target.value) || 0)
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Orders above ₹{freeDeliveryAbove} get free delivery. Below that,
              ₹{deliveryChargeAmount} is charged.
            </p>
          </div>
        )}

        <div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Delivery Settings"}
          </Button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </ComponentCard>
  );
}
