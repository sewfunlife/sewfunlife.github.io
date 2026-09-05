#!/usr/bin/env node
/**
 * Seeds the two gitignored directories the site reads from:
 *
 *   content.example/  ->  content/       (copy, project data, image manifest)
 *   placeholders/     ->  public/work/   (stand-in imagery)
 *
 * Only missing files are written. Anything you have already put in place —
 * your real photographs, your real words — is left untouched, every time.
 *
 * Runs automatically before `npm run dev` and `npm run build`, so a fresh
 * clone builds with no setup at all.
 */

import { cp, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(import.meta.dirname, "..");

const PAIRS = [
  { from: "content.example", to: "content", what: "content" },
  { from: "placeholders", to: path.join("public", "work"), what: "images" },
];

async function walk(dir, base = dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full, base)));
    else if (entry.isFile()) out.push(path.relative(base, full));
  }
  return out;
}

async function seed({ from, to, what }) {
  const source = path.join(ROOT, from);
  const target = path.join(ROOT, to);

  if (!existsSync(source)) {
    console.log(`[seed] ${from}/ not present — skipping ${what}.`);
    return { copied: 0, kept: 0 };
  }

  const files = await walk(source);
  let copied = 0;
  let kept = 0;

  for (const rel of files) {
    const dest = path.join(target, rel);
    if (existsSync(dest)) {
      kept += 1;
      continue;
    }
    await mkdir(path.dirname(dest), { recursive: true });
    await cp(path.join(source, rel), dest);
    copied += 1;
  }

  const verb = copied === 0 ? "already present" : `${copied} file(s) written`;
  console.log(
    `[seed] ${what}: ${verb}${kept ? `, ${kept} of your own left untouched` : ""}.`,
  );
  return { copied, kept };
}

async function main() {
  let totalCopied = 0;
  for (const pair of PAIRS) {
    const { copied } = await seed(pair);
    totalCopied += copied;
  }

  // A build with no content at all would produce an empty site. Say so loudly
  // rather than shipping a blank page.
  const manifest = path.join(ROOT, "content", "images.json");
  if (!existsSync(manifest)) {
    console.warn(
      "\n[seed] No content/images.json found.\n" +
        "       Put your artwork in _source/ and run `npm run images`.\n",
    );
  }

  if (totalCopied > 0) {
    console.log(
      "[seed] Example content is in place. Edit content/site.json to make it yours.",
    );
  }
}

main().catch((error) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});
