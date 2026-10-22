import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// This explicit verification path is NEVER used by `npm run build` or CI.
if (process.env.CI || process.env.GITHUB_ACTIONS || process.env.VERCEL || process.env.NODE_ENV === 'production') {
  console.error('Local build verification is forbidden in deployment environments');
  process.exit(1);
}
const [snapshot] = process.argv.slice(2);
const run = (file, args, env = process.env) => {
  const r = spawnSync(file, args, { stdio: 'inherit', env });
  if (r.status !== 0) process.exit(r.status || 1);
};
run(process.execPath, ['scripts/seed.mjs']);
run(process.execPath, ['scripts/content.mjs', snapshot ? 'snapshot' : 'fixture', ...(snapshot ? [snapshot] : [])]);
run(process.execPath, ['scripts/content.mjs', 'validate']);
// A local-only flag allows Next's production-mode compiler to consume a fixture
// receipt. The production build command overrides this flag to 0 explicitly.
rmSync('out', { recursive: true, force: true, maxRetries: 3 });
run(process.execPath, ['node_modules/next/dist/bin/next', 'build'], { ...process.env, SEWFUNLIFE_LOCAL_BUILD: '1' });
