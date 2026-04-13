'use client'
import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api";
import useAuthStore from "@/store/authStore";

const fallbackNotifications = [
  { id: 1, message: "New order received from John Doe", time: "10:00 AM", isRead: false },
  { id: 2, message: "Payment processed for order #123456", time: "10:30 AM", isRead: false },
  { id: 3, message: "Low stock alert: Item XYZ", time: "11:00 AM", isRead: true },
  { id: 4, message: "Shipment for order #123457 delayed", time: "11:30 AM", isRead: true },
  { id: 5, message: "New review submitted for product ABC", time: "12:00 PM", isRead: true },
];

const Notification = () => {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState(fallbackNotifications);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    apiGet<any>("/api/v1/user/notifications?limit=10")
      .then((res) => {
        if (res.success && res.data) {
          const items = Array.isArray(res.data) ? res.data : res.data.items ?? res.data.notifications ?? [];
          if (items.length > 0) {
            setNotifications(
              items.map((n: any) => ({
                id: n._id || n.id,
                message: n.title || n.body || n.message || "",
                time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: n.isRead ?? false,
              }))
            );
            setUnreadCount(items.filter((n: any) => !n.isRead).length);
          }
        }
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const markAllRead = () => {
    if (isAuthenticated) {
      apiPatch("/api/v1/user/notifications/read-all").catch(() => {});
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <Popover>
      <PopoverTrigger className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 duration-200 relative">
        <Bell />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent>
        <div className="">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-pink-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div key={notification.id} className={`py-3 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20 -mx-2 px-2 rounded' : ''}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notification;
