import type { NextConfig } from "next";

const apiOrigin =
  process.env.API_REWRITE_ORIGIN ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5100";

const nextConfig: NextConfig = {
  async rewrites() {
    // Optional same-origin proxy; browser calls still use NEXT_PUBLIC_API_URL.
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
