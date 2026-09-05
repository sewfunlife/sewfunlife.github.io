import type { MetadataRoute } from "next";
import { projects, site } from "@/lib/content";

/** Required by `output: "export"` — the file is written once, at build time. */
export const dynamic = "force-static";

/**
 * `output: "export"` writes this to out/sitemap.xml at build time.
 * Set `seo.url` in content/site.json for the URLs to be absolute and correct.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (site.seo.url || "https://example.com").replace(/\/$/, "");

  return [
    { url: `${base}/`, priority: 1, changeFrequency: "monthly" },
    ...projects.map((project) => ({
      url: `${base}/work/${project.slug}/`,
      priority: 0.8,
      changeFrequency: "yearly" as const,
    })),
  ];
}
