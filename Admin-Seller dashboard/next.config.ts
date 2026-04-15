import type { NextConfig } from "next";

/** Origin only — no /api suffix (rewrite adds /api/:path*). */
function normalizeProxyOrigin(url: string) {
  return url
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/v1\/?$/i, "")
    .replace(/\/api\/?$/i, "");
}

/** Proxy target when the browser calls same-origin `/api/...`. Prefer BACKEND_PROXY_URL, then NEXT_PUBLIC_API_URL, then default PORT. */
const backendProxyTarget =
  normalizeProxyOrigin(
    process.env.BACKEND_PROXY_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:5000"
  ) || "http://127.0.0.1:5000";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/sign-in", destination: "/signin", permanent: false },
      { source: "/sign-up", destination: "/signup", permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendProxyTarget}/api/:path*`,
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "amp-api.mpdreams.in", // ✅ allow your product images
      },
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
};

export default nextConfig;
