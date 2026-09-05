import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

/** Required by `output: "export"` — the file is written once, at build time. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = (site.seo.url || "https://example.com").replace(/\/$/, "");

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
