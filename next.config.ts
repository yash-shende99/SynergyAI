import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    resolveExtensions: [".ts", ".tsx", ".js"], // ✅ valid option
    resolveAlias: {
      "@": "./src",
    },
  },
};

export default nextConfig;
