import fs from "node:fs";
import path from "node:path";
import type {
  Asset,
  AssetCategory,
  ImageManifest,
  Plate,
  Project,
  Site,
} from "./types";

/*
 * Content is read from disk at build time rather than imported as a module.
 * `content/` is gitignored and seeded by scripts/seed.mjs, so it may not exist
 * when TypeScript runs — reading it here keeps typechecking independent of
 * whether anyone has seeded their content yet.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

function read<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8")) as T;
  } catch {
    console.warn(
      `[content] Could not read content/${file}. Run \`npm run seed\` to create it from content.example/.`,
    );
    return fallback;
  }
}

export const site = read<Site>("site.json", {
  name: "Your Name",
  role: "Graphic Designer",
  email: "email@example.com",
  tagline: "",
  intro: [],
  about: [],
  services: [],
  social: {},
  seo: { siteName: "Portfolio", description: "", url: "https://example.com" },
});

export const projects = read<Project[]>("projects.json", []);
export const images = read<ImageManifest>("images.json", {});

/* ------------------------------------------------------------------ */

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function assets(slug: string, category: AssetCategory): Asset[] {
  return images[slug]?.[category] ?? [];
}

/**
 * The single image that represents a project everywhere it is listed.
 * Prefers the original cover artwork, then the first mood plate, then anything.
 */
export function heroAsset(slug: string): Asset | undefined {
  const group = images[slug];
  if (!group) return undefined;
  return (
    group.cover?.[0] ??
    group.mood?.[0] ??
    group.app?.[0] ??
    group.deck?.[0]
  );
}

/**
 * Joins each mood plate to its image by `key`. Plates without a matching file
 * are dropped, and images without a written caption still appear — the wall
 * shows every photograph, labelled where a label exists.
 */
export function wall(project: Project): Array<Asset & { plate?: Plate }> {
  const files = assets(project.slug, "mood");
  const byKey = new Map(project.plates.map((p) => [p.key, p]));
  return files.map((asset) => ({ ...asset, plate: byKey.get(asset.key) }));
}

/** Previous/next in display order, wrapping at both ends. */
export function neighbours(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: undefined, next: undefined };
  const len = projects.length;
  return {
    prev: projects[(i - 1 + len) % len],
    next: projects[(i + 1) % len],
  };
}

/**
 * Every colour the studio has specified, in project order — the raw material
 * for the chromatic index on the home page.
 */
export function chromaticIndex(): Array<{ hex: string; project: string; slug: string }> {
  return projects.flatMap((p) =>
    p.palette.map((s) => ({ hex: s.hex, project: p.title, slug: p.slug })),
  );
}

/** Total number of processed images, used as a real figure in the copy. */
export function assetCount(): number {
  return Object.values(images).reduce(
    (total, group) =>
      total +
      Object.values(group).reduce((n, list) => n + (list?.length ?? 0), 0),
    0,
  );
}
