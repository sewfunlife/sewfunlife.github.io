#!/usr/bin/env node
// scripts/make-placeholders.mjs
//
// Reads `content/images.json` and, for every manifest entry, writes a tiny
// flat-colour placeholder WebP under `placeholders/<same relative path as
// under public/work/>`. These ship in the public repo instead of the real,
// full-resolution artwork (see .gitignore) — the site reads the real pixel
// dimensions for layout from the manifest's `w`/`h` fields, not from the
// placeholder file, so the placeholder itself only needs to be small.
//
// Usage: node scripts/make-placeholders.mjs   (or `npm run placeholders`)

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'content', 'images.json');
const PLACEHOLDERS_ROOT = path.join(ROOT, 'placeholders');

const MAX_EDGE = 32; // placeholder file's own longest edge, in px
const DARKEN_FACTOR = 0.45; // placeholder fill = manifest `dom` colour scaled toward black

function darken(hex, factor) {
  const n = hex.replace('#', '');
  const r = Math.round(parseInt(n.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(n.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(n.slice(4, 6), 16) * factor);
  return { r, g, b };
}

// Writes one tiny flat-colour placeholder for a manifest `src` (or `sm`)
// path. Both share the same `w`/`h` aspect ratio (the small variant is just
// a downsized copy of the full image), so a single aspect ratio suffices for
// scaling either down to MAX_EDGE.
async function writePlaceholder(src, w, h, dom) {
  const rel = src.replace(/^\/work\//, '');
  const outPath = path.join(PLACEHOLDERS_ROOT, rel);
  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const scale = MAX_EDGE / Math.max(w, h);
  const outW = Math.max(1, Math.round(w * scale));
  const outH = Math.max(1, Math.round(h * scale));
  const { r, g, b } = darken(dom, DARKEN_FACTOR);

  await sharp({
    create: { width: outW, height: outH, channels: 3, background: { r, g, b } },
  })
    .webp({ quality: 40, effort: 5 })
    .toFile(outPath);
}

async function main() {
  const raw = await fs.readFile(MANIFEST_PATH, 'utf8');
  const manifest = JSON.parse(raw);

  let count = 0;
  for (const slug of Object.keys(manifest)) {
    for (const category of Object.keys(manifest[slug])) {
      for (const entry of manifest[slug][category]) {
        await writePlaceholder(entry.src, entry.w, entry.h, entry.dom);
        count += 1;

        if (entry.sm) {
          await writePlaceholder(entry.sm, entry.w, entry.h, entry.dom);
          count += 1;
        }
      }
    }
  }

  console.log(`Wrote ${count} placeholders to ${PLACEHOLDERS_ROOT}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
