import fs from 'node:fs';
import path from 'node:path';
import { ContentError, transform } from './content/adapter.mjs';
import { readGoogleSheets } from './content/google.mjs';
import { invalidate, verifyFiles, writeResult } from './content/storage.mjs';

export function localOnly(env = process.env) {
  if (env.CI || env.GITHUB_ACTIONS || env.VERCEL || env.NODE_ENV === 'production') throw new ContentError('Fixture/snapshot commands are local-only');
}
async function main() {
  // Node >=20.19, matching Next 16. Secrets already injected by CI take priority.
  if (fs.existsSync('.env.local')) process.loadEnvFile('.env.local');
  const [command, file] = process.argv.slice(2);
  if (command === 'validate') {
    const { payload, source } = await verifyFiles(undefined, { requireLive: !!(process.env.CI || process.env.GITHUB_ACTIONS || process.env.VERCEL || process.env.NODE_ENV === 'production') });
    console.log(`[content] validated (${source}): ${Object.entries(payload).map(([k, v]) => `${k}=${v.length}`).join(', ')}`);
    return;
  }
  if (!['sync', 'fixture', 'snapshot'].includes(command)) throw new ContentError('Use sync, validate, fixture, or snapshot');
  const live = command === 'sync';
  if (!live) localOnly();
  // Remove old results BEFORE authentication, transport, or validation.
  await invalidate();
  try {
    const workbook = live ? await readGoogleSheets() : JSON.parse(fs.readFileSync(path.resolve(file || 'tests/fixtures/workbook.json'), 'utf8'));
    const result = transform(workbook, { assetBase: process.env.ASSET_BASE_URL || '' });
    await writeResult(result, live ? 'live' : command === 'snapshot' ? 'connector-snapshot' : 'local-fixture');
    console.log(`[content] ${command} complete: ${JSON.stringify(result.counts)}`);
  } catch (error) {
    await invalidate();
    throw error;
  }
}
// Never print third-party exceptions: they may contain credentials or raw rows.
main().catch(error => { console.error(`[content] ${error instanceof ContentError ? error.message : 'Failed to process content (details suppressed)'}`); process.exitCode = 1; });
