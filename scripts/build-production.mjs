import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { verifyFiles } from './content/storage.mjs';
// Direct invocations also require a live receipt.
try { await verifyFiles(undefined, { requireLive: true }); }
catch { console.error('Production build requires a successful live content:sync'); process.exit(1); }
rmSync('out', { recursive: true, force: true, maxRetries: 3 });
const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {
  stdio: 'inherit', env: { ...process.env, SEWFUNLIFE_LOCAL_BUILD: '0' },
});
process.exit(result.status || (result.error ? 1 : 0));
