"use client";

import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { apiPatch } from "@/lib/api";
import useAuthStore from "@/store/authStore";

interface OrderActionsProps {
  orderId?: string;
  onStatusChange?: () => void;
}

const OrderActions = ({ orderId, onStatusChange }: OrderActionsProps) => {
  const role = useAuthStore((s) => s.user?.role) ?? "admin";
  const isAdmin = role === "admin" || role === "staff";

  const handleStatusChange = async (value: string) => {
    if (!isAdmin || !orderId) return;
    const res = await apiPatch(`/api/v1/admin/orders/${orderId}/status`, { status: value });
    if (res.success && onStatusChange) onStatusChange();
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger>
          <div className="flex items-center justify-center hover:bg-slate-200 p-2 rounded-full dark:hover:bg-slate-900 duration-200">
            <MoreHorizontal />
          </div>
        </PopoverTrigger>
        <PopoverContent className="text-start">
          <Link
            href={`/dashboard/orders/${orderId || ""}`}
            className="py-2 px-4 rounded-md w-full block hover:bg-slate-200 dark:hover:bg-slate-900"
          >
            View Details
          </Link>
          {isAdmin && (
            <Select onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full text-base px-4 border-none outline-none focus:ring-offset-0 focus:ring-0 hover:bg-slate-200 dark:hover:bg-slate-900">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default OrderActions;
