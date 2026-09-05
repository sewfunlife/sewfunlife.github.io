import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder. Without it, an unrelated lockfile
  // further up the filesystem can be inferred as the root and change how
  // modules resolve.
  turbopack: { root: path.resolve(import.meta.dirname) },

  // Emit a fully static site into `out/`. There is no server runtime, so the
  // same build artifact deploys unchanged to Netlify, Cloudflare Pages,
  // GitHub Pages or any bucket that can serve files.
  output: "export",

  // Static export has no image optimization server. Every image is already
  // converted to a sized WebP at build time by scripts/optimize-images.mjs.
  images: { unoptimized: true },

  // Emit `/work/faded/index.html` rather than `/work/faded.html`, so both
  // Netlify and Cloudflare Pages resolve clean URLs with no redirect rules.
  trailingSlash: true,
};

export default nextConfig;
