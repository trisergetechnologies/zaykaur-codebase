"use client";

import Link from "next/link";
import { Grid } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-200" />
      </div>

      <div className="relative z-10 max-w-3xl text-center px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg">
          Zaykaur Dashboard
        </h1>
        <p className="mt-6 text-lg md:text-xl text-white/90">
          Admin & Seller dashboard for products, orders, sellers, and reports.
        </p>

        <div className="mt-12">
          <Link
            href="/signin"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-indigo-600 font-semibold text-lg shadow-xl hover:scale-105 hover:shadow-2xl transition transform"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur text-white font-semibold text-lg border border-white/30 hover:bg-white/20 transition"
          >
            <Grid className="w-6 h-6" />
            Go to Dashboard
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 text-sm text-white/70">
        Zaykaur Admin & Seller Dashboard
      </div>
    </div>
  );
}
