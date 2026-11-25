import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT === "1"
    ? { output: "export", images: { unoptimized: true } }
    : process.env.STANDALONE === "1"
      ? { output: "standalone" }
      : {}),
  experimental: {
    cpus: process.env.STATIC_EXPORT === "1" ? 1 : 2,
  },
};

export default nextConfig;
