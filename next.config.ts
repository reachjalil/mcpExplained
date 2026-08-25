import type { NextConfig } from "next";

/**
 * `NEXT_PUBLIC_BASE_PATH` lets the same build serve from a GitHub Pages
 * project subpath (`/mcpExplained`) or from a domain root (Vercel, Netlify).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
