import type { NextConfig } from "next";
import path from "path";

const apiOrigin =
  process.env.API_REWRITE_ORIGIN ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:5100";

const nextConfig: NextConfig = {
  // Prevent Next from treating the monorepo parent lockfile as the app root
  // (that caused Client Manifest misses and hung compiles).
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
