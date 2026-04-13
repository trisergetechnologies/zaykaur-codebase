"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuthStore from "@/store/authStore";

const UserAvatar = () => {
  const { user, isAuthenticated } = useAuthStore();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "G";

  return (
    <div className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={user?.avatar || ""} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="font-semibold text-lg">
          {isAuthenticated ? `Welcome, ${user?.name?.split(" ")[0]}` : "Welcome,"}
        </h2>
        <p className="-mt-1 text-sm text-muted-foreground">
          {isAuthenticated ? user?.email : "Sign in to continue"}
        </p>
      </div>
    </div>
  );
};

export default UserAvatar;
