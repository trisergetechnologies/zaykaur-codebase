"use client";

import React from "react";

type NetworkUser = {
  _id: string;
  name: string;
  email?: string;
  serialNumber: number;
  referralCode?: string;
  hasPackage: boolean;
  package?: string;
  direction: "above" | "below";
};

type YouUser = {
  _id: string;
  name: string;
  serialNumber: number;
  package: string;
};

type NetworkResponse = {
  you: YouUser;
  network: NetworkUser[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  data: NetworkResponse | null;
};

export default function NetworkModal({ open, onClose, data }: Props) {
  if (!open || !data) return null;

  const above = data.network
    .filter((u) => u.direction === "above")
    .sort((a, b) => a.serialNumber - b.serialNumber); // ascending
  const below = data.network
    .filter((u) => u.direction === "below")
    .sort((a, b) => a.serialNumber - b.serialNumber);

  const UserCard: React.FC<{ user: NetworkUser | YouUser; isYou?: boolean }> = ({
    user,
    isYou,
  }) => (
    <div
      className={`px-4 py-3 rounded-lg shadow text-center ${
        isYou
          ? "bg-indigo-600 text-white font-bold ring-2 ring-indigo-400"
          : "bg-white dark:bg-gray-800"
      }`}
    >
      <div className="text-sm font-medium">{user.name}</div>
      <div className="text-xs opacity-80">
        SN: {user.serialNumber} {isYou && "(Current)"}
      </div>
      {"package" in user && (
        <div className="mt-1 text-xs">
          Package:{" "}
          <span
            className={`px-2 py-0.5 rounded ${
              user.package === "Diamond"
                ? "bg-purple-100 text-purple-700"
                : user.package === "Gold"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {user.package || "None"}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-3xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold">
            Network View — {data.you.name} (SN: {data.you.serialNumber})
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col items-center gap-6">
            {/* Above */}
            {above.map((u) => (
              <UserCard key={u._id} user={u} />
            ))}

            {/* You */}
            <UserCard user={data.you} isYou />

            {/* Below */}
            {below.map((u) => (
              <UserCard key={u._id} user={u} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
