"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useAuthStore from "@/store/authStore";
import { apiGet } from "@/lib/api";

const MyAccountPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      apiGet<any>("/api/v1/user/me")
        .then((res) => {
          if (res.success && res.data) {
            setProfile(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.name || user?.name || "John Doe";
  const displayEmail = profile?.email || user?.email || "john@example.com";
  const displayPhone = profile?.phone || user?.phone || "";
  const addresses = profile?.addresses ?? [];
  const primaryAddress = addresses.find((a: any) => a.isDefault) || addresses[0];

  return (
    <div className="px-4 py-8 lg:px-16 lg:py-12 bg-gray-100 dark:bg-gray-800">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-8">
          My Account
        </h1>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <p className="text-gray-800 dark:text-white">{displayName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <p className="text-gray-800 dark:text-white">{displayEmail}</p>
            </div>
            {displayPhone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <p className="text-gray-800 dark:text-white">{displayPhone}</p>
              </div>
            )}
          </div>
        </div>
        <div className="mt-8 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
          <div className='flex items-center justify-between'>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Address</h2>
          <Link href={'/my-account/edit'} className='p-2 rounded-md border'>Edit Address</Link>
          </div>
          
          {primaryAddress ? (
            <div>
              <p className="text-gray-800 dark:text-white">{primaryAddress.fullName || primaryAddress.name}</p>
              <p className="text-gray-800 dark:text-white">{primaryAddress.street || primaryAddress.address}</p>
              <p className="text-gray-800 dark:text-white">
                {primaryAddress.city}{primaryAddress.state ? `, ${primaryAddress.state}` : ""} {primaryAddress.postalCode || primaryAddress.pincode}
              </p>
              <p className="text-gray-800 dark:text-white">{primaryAddress.country || "India"}</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-800 dark:text-white">123 Main Street</p>
              <p className="text-gray-800 dark:text-white">City, State, ZIP</p>
              <p className="text-gray-800 dark:text-white">Country</p>
            </div>
          )}
        </div>
        <div className="mt-8 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Order History</h2>
          <div>
            <div className="border-t border-gray-200 dark:border-gray-700 py-4">
              <Link href="/my-orders" className="text-pink-600 font-medium hover:underline">
                View all orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
