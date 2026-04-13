"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SearchBox = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    const params = new URLSearchParams(searchParams);
    params.set("query", searchTerm);

    router.push(`/search?${params.toString()}`);
  };

  useEffect(() => {
    if (pathname !== "/search") {
      setSearchTerm("");
    }
  }, [pathname]);

  return (
    <form
      onSubmit={onSubmit}
      className="
        flex items-center
        w-full
        h-[42px]
        bg-gray-100
        rounded-full
        px-4
        transition
        focus-within:bg-white
        focus-within:ring-2
        focus-within:ring-pink-500
      "
    >
      {/* Search Icon */}
      <Search size={18} className="text-gray-500 mr-3" />

      {/* Input */}
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Try Saree, Kurti or Search by Product Code"
        className="
          w-full
          bg-transparent
          outline-none
          text-sm
          placeholder:text-gray-500
        "
      />
    </form>
  );
};

export default SearchBox;