import { sign } from 'node:crypto';
import { ContentError, SHEETS } from './adapter.mjs';

export const SECRET_NAMES = ['SEWFUNLIFE_SPREADSHEET_ID', 'GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'];
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';
// Start at header row 4; bounded to the current complete column grids.
// No workbook-wide read, Drive scope, or discovery of non-website sheets.
export const RANGES = Object.freeze(SHEETS.map(name => `'${name}'!A4:${({
  '網站_Courses': 'AN', '網站_Media': 'X', '網站_Sessions': 'T',
  '網站_Instructor': 'T', '網站_FAQ': 'L', '網站_Terms': 'N', '網站_Schema': 'P',
})[name]}`));
const b64 = text => Buffer.from(text).toString('base64url');

async function request(fetcher, url, init, label) {
  let response;
  try { response = await fetcher(url, { ...init, redirect: 'error', signal: AbortSignal.timeout(30_000) }); }
  catch { throw new ContentError(`${label}: network request failed`); }
  if (!response.ok) throw new ContentError(`${label}: HTTP ${response.status}`);
  try { return await response.json(); } catch { throw new ContentError(`${label}: invalid JSON response`); }
}

export async function readGoogleSheets(env = process.env, fetcher = fetch) {
  const missing = SECRET_NAMES.filter(name => !env[name]?.trim());
  if (missing.length) throw new ContentError(`Missing build-time secrets: ${missing.join(', ')}`);
  const id = env.SEWFUNLIFE_SPREADSHEET_ID.trim();
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL.trim();
  if (!/^[\w-]+$/.test(id) || !/^[^\s@]+@[^\s@]+\.gserviceaccount\.com$/.test(email)) throw new ContentError('Invalid build-time credential configuration');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64(JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }))}`;
  let signature;
  try { signature = sign('RSA-SHA256', Buffer.from(unsigned), env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n')).toString('base64url'); }
  catch { throw new ContentError('Service Account signing failed (check private key configuration)'); }
  const token = await request(fetcher, TOKEN_URL, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
  }, 'Google OAuth');
  if (typeof token.access_token !== 'string' || !token.access_token) throw new ContentError('Google OAuth: access token missing');
  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(id)}/values:batchGet`);
  url.searchParams.set('majorDimension', 'ROWS');
  url.searchParams.set('valueRenderOption', 'FORMATTED_VALUE');
  RANGES.forEach(range => url.searchParams.append('ranges', range));
  const result = await request(fetcher, url, { headers: { authorization: `Bearer ${token.access_token}` } }, 'Google Sheets');
  if (!Array.isArray(result.valueRanges) || result.valueRanges.length !== SHEETS.length) throw new ContentError('Google Sheets: incomplete whitelist response');
  return Object.fromEntries(SHEETS.map((name, i) => {
    // Never attribute a reordered/incorrect range to another table.
    const range = result.valueRanges[i];
    if (!range.range?.startsWith(`'${name}'!`) && !range.range?.startsWith(`${name}!`)) throw new ContentError('Google Sheets: unexpected response range');
    return [name, range.values ?? []];
  }));
}
