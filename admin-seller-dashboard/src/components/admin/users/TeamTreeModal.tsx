"use client";

import React, { useEffect, useState } from "react";

type TeamUser = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  referralCode?: string;
};

type ReferralNode = {
  user: TeamUser;
  referrals: ReferralNode[];
};

type TeamResponse = {
  user: TeamUser;
  referrals: ReferralNode[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  data: TeamResponse | null;
};

export default function TeamTreeModal({ open, onClose, data }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (data) {
      setExpanded({ [data.user.id]: true }); // expand root initially
    }
  }, [data]);

  if (!open || !data) return null;

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const Node: React.FC<{ node: ReferralNode | TeamResponse; depth?: number }> = ({
    node,
    depth = 0,
  }) => {
    const u = node.user;
    const isExpanded = expanded[u.id];
    const hasChildren = node.referrals.length > 0;

    return (
      <div className="ml-6">
        {/* Node card */}
        <div
          className={`flex items-center gap-2 p-3 rounded-lg shadow-sm border transition cursor-pointer ${
            hasChildren ? "hover:bg-gray-50 dark:hover:bg-gray-800" : ""
          }`}
          onClick={() => hasChildren && toggleExpand(u.id)}
        >
          {/* Expand/collapse */}
          {hasChildren ? (
            <span
              className={`w-6 h-6 flex items-center justify-center text-xs rounded-full border ${
                isExpanded
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {isExpanded ? "−" : "+"}
            </span>
          ) : (
            <span className="w-6 h-6 flex items-center justify-center text-gray-400">•</span>
          )}

          {/* Info */}
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {u.name || "Unnamed"}{" "}
              <span className="text-xs text-gray-500">({u.referralCode})</span>
            </div>
            <div className="text-xs text-gray-500">{u.email || u.phone}</div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-6 mt-2 border-l border-gray-200 dark:border-gray-700 pl-4 space-y-2">
            {node.referrals.map((child) => (
              <Node key={child.user.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-full max-w-5xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold">
            Team Tree — {data.user.name} ({data.user.referralCode})
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700"
          >
            Close
          </button>
        </div>

        {/* Scrollable tree */}
        <div className="flex-1 overflow-auto pr-4">
          <Node node={data} />
        </div>
      </div>
    </div>
  );
}
