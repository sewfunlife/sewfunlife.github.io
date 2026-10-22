import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
if (process.env.CI || process.env.GITHUB_ACTIONS || process.env.VERCEL || process.env.NODE_ENV === 'production') process.exit(1);
for (const args of [['scripts/seed.mjs'], ...(!existsSync('content/generated') ? [['scripts/content.mjs', 'fixture']] : []), ['scripts/content.mjs', 'validate']]) {
  const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
}
