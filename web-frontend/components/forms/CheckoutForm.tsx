"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { apiPost } from "@/lib/api";
import useAuthStore from "@/store/authStore";

const schema = z.object({
  firstName: z.string().min(2, "Enter valid first name"),
  lastName: z.string().min(2, "Enter valid last name"),
  address: z.string().min(5, "Enter full address"),
  landmark: z.string().optional(),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter valid 10 digit mobile number"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "Select state"),
  zip: z.string().regex(/^\d{6}$/, "Enter valid 6 digit PIN code"),
  country: z.string().default("India"),
  saveAddress: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

const states = [
  "Delhi",
  "Haryana",
  "Uttar Pradesh",
  "Punjab",
  "Rajasthan",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
];

const CheckoutForm: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: "India",
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (isAuthenticated) {
      try {
        const res = await apiPost("/api/v1/customer/address", {
          fullName: `${data.firstName} ${data.lastName}`,
          phone: data.phone,
          street: data.address + (data.landmark ? `, ${data.landmark}` : ""),
          city: data.city,
          state: data.state,
          postalCode: data.zip,
          country: data.country,
        });
        if (res.success) {
          toast.success("Address saved successfully");
          reset();
          return;
        }
        toast.error(res.message || "Failed to save address");
      } catch {
        toast.error("Something went wrong");
      }
    } else {
      toast.success("Address saved locally");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* Name */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label>First Name</Label>
          <Input {...register("firstName")} />
          {errors.firstName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <Label>Last Name</Label>
          <Input {...register("lastName")} />
          {errors.lastName && (
            <p className="text-xs text-red-500 mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <Label>Flat / House No / Building</Label>
        <Input {...register("address")} />
        {errors.address && (
          <p className="text-xs text-red-500 mt-1">
            {errors.address.message}
          </p>
        )}
      </div>

      <div>
        <Label>Landmark (Optional)</Label>
        <Input {...register("landmark")} />
      </div>

      {/* Phone */}
      <div>
        <Label>Mobile Number</Label>
        <Input type="tel" {...register("phone")} />
        {errors.phone && (
          <p className="text-xs text-red-500 mt-1">
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* City & State */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label>City</Label>
          <Input {...register("city")} />
          {errors.city && (
            <p className="text-xs text-red-500 mt-1">
              {errors.city.message}
            </p>
          )}
        </div>

        <div>
          <Label>State</Label>
          <select
            {...register("state")}
            className="w-full h-11 border rounded-md px-3 text-sm"
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state}>{state}</option>
            ))}
          </select>
          {errors.state && (
            <p className="text-xs text-red-500 mt-1">
              {errors.state.message}
            </p>
          )}
        </div>
      </div>

      {/* PIN & Country */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Label>PIN Code</Label>
          <Input {...register("zip")} />
          {errors.zip && (
            <p className="text-xs text-red-500 mt-1">
              {errors.zip.message}
            </p>
          )}
        </div>

        <div>
          <Label>Country</Label>
          <Input disabled {...register("country")} />
        </div>
      </div>

      {/* Save Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("saveAddress")}
          className="w-4 h-4"
        />
        <span className="text-sm text-muted-foreground">
          Save this address for future orders
        </span>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full py-6 bg-black hover:bg-black/90"
      >
        {isSubmitting ? "Saving..." : "Save & Continue"}
      </Button>
    </form>
  );
};

export default CheckoutForm;