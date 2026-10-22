import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ContentError, FILES, readPayload, validateGenerated } from './adapter.mjs';

export const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function locations(root = process.cwd()) {
  return { output: path.join(root, 'content/generated'), cache: path.join(root, '.cache/sewfunlife-content') };
}
export async function invalidate(root) {
  const { output, cache } = locations(root);
  await fs.rm(output, { recursive: true, force: true });
  await fs.rm(cache, { recursive: true, force: true });
}
export async function writeResult(result, source, root) {
  const { output, cache } = locations(root);
  const temp = `${output}.tmp`;
  await fs.rm(temp, { recursive: true, force: true });
  await fs.mkdir(temp, { recursive: true });
  await fs.mkdir(cache, { recursive: true });
  const hashes = {};
  for (const name of FILES) {
    await fs.writeFile(path.join(temp, `${name}.json`), `${JSON.stringify(result.payload[name], null, 2)}\n`);
    hashes[name] = digest(result.payload[name]);
  }
  // Contract is a build-only receipt, never stored under public/ or generated/.
  await fs.writeFile(path.join(cache, 'receipt.json'), JSON.stringify({ source, hashes, contract: result.contract }));
  await fs.rename(temp, output);
}
export async function verifyFiles(root, { requireLive = false } = {}) {
  const { output, cache } = locations(root);
  let payload, receipt;
  try {
    payload = readPayload(output);
    receipt = JSON.parse(await fs.readFile(path.join(cache, 'receipt.json'), 'utf8'));
  } catch (error) {
    if (error instanceof ContentError) throw error;
    throw new ContentError('Generated content/receipt missing or unreadable; run content:sync');
  }
  if (!['live', 'local-fixture', 'connector-snapshot'].includes(receipt.source)) throw new ContentError('Invalid content provenance');
  if (requireLive && receipt.source !== 'live') throw new ContentError('Production requires live Service Account sync');
  for (const name of FILES) if (receipt.hashes?.[name] !== digest(payload[name])) throw new ContentError('Generated content changed after validation');
  validateGenerated(payload, receipt.contract);
  return { payload, source: receipt.source };
}
