#!/usr/bin/env node
// Only site.json remains repo-owned configuration. Courses/Media are generated
// by the Sheet adapter; legacy projects.json/images.json are never seeded.
import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
await mkdir(path.join(root, 'content'), { recursive: true });
const dest = path.join(root, 'content/site.json');
if (!existsSync(dest)) await copyFile(path.join(root, 'content.example/site.json'), dest);
console.log('[seed] site.json ready; structured content requires explicit sync or local fixture');
