import fs from 'node:fs';
import baseline from './contract.json' with { type: 'json' };

// Contract assertions detect deleted/renamed fields and privacy downgrades.
// Labels and enum mappings always come from live Schema / Terms, never here.
export const TABLES = Object.freeze({
  '網站_Courses': 'courses', '網站_Media': 'media', '網站_Sessions': 'sessions',
  '網站_Instructor': 'instructors', '網站_FAQ': 'faq',
});
export const SHEETS = Object.freeze([...Object.keys(TABLES), '網站_Terms', '網站_Schema']);
export const FILES = Object.freeze(Object.values(TABLES));
const BUILD_ONLY = new Set(['legacy_source', 'notes', 'privacy_note', 'material_fee_note']);
const safePrivacy = new Set(['not_applicable', 'public', 'edited']);
const safeUsage = new Set(['website', 'both']);
// Stable system identifiers encode policy, not Chinese display-label mappings.
const SYSTEM_KEYS = {
  course_status: ['active', 'paused', 'archived'],
  media_type: ['course_cover', 'work_showcase', 'session_media', 'youtube', 'instructor_photo'],
  privacy_status: ['not_applicable', 'pending', 'public', 'edited', 'private'],
  usage_scope: ['website', 'social', 'both', 'internal'],
  faq_category: ['course', 'registration', 'venue', 'fee', 'other'],
  yes_no: ['yes', 'no'], term_status: ['confirmed', 'pending', 'deprecated'],
};
export class ContentError extends Error {}
function fail(where, reason) { throw new ContentError(`${where}: ${reason}`); }
const clean = value => value == null ? '' : String(value).trim();
const present = value => value !== null && value !== undefined && value !== '';
function unique(values, where) {
  if (new Set(values).size !== values.length) fail(where, 'duplicate key');
}
function grid(workbook, name) {
  const rows = workbook[name];
  if (!Array.isArray(rows) || !Array.isArray(rows[0])) fail(name, 'missing header row');
  const headers = rows[0].map(clean);
  unique(headers.filter(Boolean), name);
  return rows.slice(1).flatMap((row, index) => {
    if (!Array.isArray(row)) fail(name, 'invalid row');
    if (!row.some(v => clean(v) !== '')) return [];
    row.forEach((v, col) => {
      if (clean(v) && !headers[col]) fail(`${name} row ${index + 5}`, 'data without a column definition');
    });
    return [{ values: Object.fromEntries(headers.filter(Boolean).map(h => [h, row[headers.indexOf(h)]])), row: index + 5 }];
  });
}
function requireHeaders(workbook, name, required) {
  const headers = workbook[name]?.[0]?.map(clean) ?? [];
  for (const label of required) if (!headers.includes(label)) fail(name, 'required header missing');
}

export function readTerms(workbook) {
  const name = '網站_Terms';
  requireHeaders(workbook, name, ['術語ID', '領域', '系統Key', '繁中顯示名稱', '狀態', '最後更新']);
  const rows = grid(workbook, name).map(({ values: v }) => ({
    id: clean(v['術語ID']), domain: clean(v['領域']), key: clean(v['系統Key']),
    label: clean(v['繁中顯示名稱']), status: clean(v['狀態']),
  }));
  for (const r of rows) if (!r.id || !r.domain || !r.key || !r.label || !r.status) fail(name, 'required Terms field missing');
  unique(rows.map(r => r.id), name);
  unique(rows.map(r => `${r.domain}:${r.key}`), name);
  unique(rows.map(r => `${r.domain}:${r.label}`), name);
  for (const [domain, keys] of Object.entries(SYSTEM_KEYS)) {
    const actual = rows.filter(r => r.domain === domain).map(r => r.key).sort();
    if (JSON.stringify(actual) !== JSON.stringify([...keys].sort())) fail(name, 'locked system vocabulary keys changed');
  }
  const statuses = rows.filter(r => r.domain === 'term_status');
  const confirmed = statuses.find(r => r.key === 'confirmed')?.label;
  if (!confirmed || statuses.find(r => r.key === 'confirmed')?.status !== confirmed) fail(name, 'term_status bootstrap invalid');
  const byDomain = new Map();
  for (const r of rows) {
    if (!statuses.some(s => s.label === r.status)) fail(name, 'unrecognized Terms status');
    if (r.status === confirmed) {
      if (!byDomain.has(r.domain)) byDomain.set(r.domain, new Map());
      byDomain.get(r.domain).set(r.label, r.key);
    }
  }
  function map(domain, value, where) {
    const key = byDomain.get(domain)?.get(clean(value));
    if (!key) fail(where, 'unconfirmed or unknown controlled vocabulary');
    return key;
  }
  function boolean(value, where) {
    const key = map('yes_no', value, where);
    if (!['yes', 'no'].includes(key)) fail(where, 'invalid Boolean mapping');
    return key === 'yes';
  }
  return { map, boolean, domains: Object.fromEntries([...byDomain].map(([d, m]) => [d, [...m.values()]])) };
}

export function readSchema(workbook, terms) {
  const name = '網站_Schema';
  requireHeaders(workbook, name, ['資料表', '欄位順序', 'field_key', '繁中顯示名稱', '資料型別', '必填', '受控詞彙', '可見層級', '備註']);
  const fields = grid(workbook, name).map(({ values: v, row }) => {
    const f = { table: clean(v['資料表']), order: Number(v['欄位順序']), key: clean(v.field_key), label: clean(v['繁中顯示名稱']),
      type: clean(v['資料型別']), required: terms.boolean(v['必填'], `${name} row ${row}`),
      vocab: clean(v['受控詞彙']) || null, visibility: clean(v['可見層級']), list: clean(v['備註']).includes('多項以；分隔') };
    const b = baseline.find(b => b.table === f.table && b.key === f.key);
    if (!b || !f.label || !Number.isInteger(f.order)) fail(`${name} row ${row}`, 'unrecognized field contract');
    for (const key of ['order', 'type', 'required', 'vocab', 'visibility', 'list']) {
      if (f[key] !== b[key]) fail(`${name} row ${row}`, 'locked field contract changed');
    }
    return f;
  });
  unique(fields.map(f => `${f.table}:${f.key}`), name);
  unique(fields.map(f => `${f.table}:${f.label}`), name);
  if (fields.length !== baseline.length) fail(name, 'required Schema field missing');
  return fields;
}

function date(value, where) {
  const s = clean(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) fail(where, 'date must be YYYY-MM-DD');
  const timestamp = Date.parse(`${s}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== s) fail(where, 'invalid calendar date');
  return s;
}
function number(value, integer, where) {
  const s = clean(value);
  if (!(integer ? /^-?\d+$/ : /^-?\d+(\.\d+)?$/).test(s)) fail(where, 'invalid numeric value');
  const n = Number(s);
  if (!Number.isFinite(n) || (integer && !Number.isSafeInteger(n))) fail(where, 'numeric value out of range');
  return n;
}
function convert(value, f, terms, where) {
  const s = clean(value);
  if (!s) { if (f.required) fail(where, 'required value missing'); return null; }
  if (f.type === 'boolean') return terms.boolean(value, where);
  if (f.type === 'enum') return terms.map(f.vocab, value, where);
  if (f.type === 'integer' || f.type === 'number') {
    const n = number(value, f.type === 'integer', where);
    if (f.key === 'difficulty_level' && (n < 1 || n > 5)) fail(where, 'difficulty must be 1–5');
    return n;
  }
  if (f.type === 'date') return date(value, where);
  if (f.type === 'url') { if (!/^https:\/\//.test(s)) fail(where, 'expected HTTPS URL'); try { new URL(s); } catch { fail(where, 'invalid URL'); } }
  return f.list ? s.split('；').map(clean).filter(Boolean) : s;
}

function normalizedRows(workbook, table, fields, terms) {
  const specs = fields.filter(f => f.table === table);
  const headers = workbook[table]?.[0]?.map(clean) ?? [];
  requireHeaders(workbook, table, specs.map(f => f.label));
  if (headers.filter(Boolean).some(h => !specs.some(f => f.label === h))) fail(table, 'unrecognized column');
  return grid(workbook, table).map(({ values, row }) => Object.fromEntries(specs.map(f => [f.key, convert(values[f.label], f, terms, `${table} row ${row} field ${f.key}`)])));
}

export function resolveAsset(value, assetBase = '') {
  const s = clean(value);
  if (/^https:\/\//.test(s)) {
    let url; try { url = new URL(s); } catch { fail('Media', 'invalid asset URL'); }
    if (url.username || url.password) fail('Media', 'asset URL credentials forbidden');
    return url.href;
  }
  // No protocol-relative URLs, absolute URLs, traversal, fragments, or queries.
  if (!s || /[\\\s?#:%]/.test(s) || s.startsWith('/') || s.split('/').some(p => !p || p === '.' || p === '..')) fail('Media', 'unsafe relative asset path');
  if (!assetBase) return `/work/${s}`;
  let base; try { base = new URL(assetBase); } catch { fail('ASSET_BASE_URL', 'invalid base URL'); }
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) fail('ASSET_BASE_URL', 'expected HTTPS base URL');
  return new URL(s, `${base.href.replace(/\/$/, '')}/`).href;
}

function relations(data) {
  const courses = new Map(data.courses.map(r => [r.course_id, r]));
  const sessions = new Map(data.sessions.map(r => [r.session_id, r]));
  const media = new Map(data.media.map(r => [r.media_id, r]));
  for (const [name, key] of [['courses', 'course_id'], ['media', 'media_id'], ['sessions', 'session_id'], ['instructors', 'instructor_id'], ['faq', 'faq_id']]) unique(data[name].map(r => r[key]), name);
  unique(data.courses.map(r => r.slug), 'Course slug');
  for (const c of data.courses) {
    if (!/^CRS-\d+$/.test(c.course_id)) fail('Course', 'course_id must retain CRS format');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.slug)) fail('Course', 'unsafe slug');
    if (c.course_status === 'archived' && c.published) fail('Course', 'archived course cannot be published');
    if (c.cover_media_id && (!media.has(c.cover_media_id) || media.get(c.cover_media_id).course_id !== c.course_id || media.get(c.cover_media_id).media_type !== 'course_cover')) fail('Course', 'invalid cover FK');
    for (const [min, max] of [['duration_min_minutes', 'duration_max_minutes'], ['participant_min', 'participant_max']]) {
      if ((present(c[min]) && c[min] < 0) || (present(c[max]) && c[max] < 0) || (present(c[min]) && present(c[max]) && c[min] > c[max])) fail('Course', 'invalid numeric range');
    }
  }
  for (const s of data.sessions) if (!courses.has(s.course_id)) fail('Session', 'broken Course FK');
  for (const q of data.faq) if (q.course_id && !courses.has(q.course_id)) fail('FAQ', 'broken Course FK');
  for (const i of data.instructors) if (i.photo_media_id && (!media.has(i.photo_media_id) || media.get(i.photo_media_id).media_type !== 'instructor_photo')) fail('Instructor', 'invalid photo FK');
  for (const m of data.media) {
    if (m.course_id && !courses.has(m.course_id)) fail('Media', 'broken Course FK');
    if (m.session_id && (!sessions.has(m.session_id) || (m.course_id && sessions.get(m.session_id).course_id !== m.course_id))) fail('Media', 'broken or mismatched Session FK');
    if (m.media_type === 'session_media' && !m.session_id) fail('Media', 'session_media requires Session');
    if (['course_cover', 'work_showcase'].includes(m.media_type) && (!m.course_id || m.session_id)) fail('Media', 'Course media requires Course-only relation');
    if (!m.course_id && !m.session_id && !(m.media_type === 'instructor_photo' && data.instructors.some(i => i.photo_media_id === m.media_id))) fail('Media', 'missing owner relation');
    for (const key of ['width', 'height']) if (present(m[key]) && m[key] <= 0) fail('Media', 'invalid image dimensions');
  }
}

export function transform(workbook, { assetBase = '' } = {}) {
  if (Object.keys(workbook).some(n => !SHEETS.includes(n)) || SHEETS.some(n => !Object.hasOwn(workbook, n))) fail('Workbook', 'exactly seven whitelisted Sheets required');
  const terms = readTerms(workbook);
  const fields = readSchema(workbook, terms);
  const all = Object.fromEntries(Object.entries(TABLES).map(([t, name]) => [name, normalizedRows(workbook, t, fields, terms)]));
  // Also validate every Terms row (including unused/draft terms), using Schema.
  normalizedRows(workbook, '網站_Terms', fields, { ...terms, map(domain, value, where) {
    if (domain === 'term_status') {
      const raw = grid(workbook, '網站_Terms').find(({ values: v }) => clean(v['領域']) === domain && clean(v['繁中顯示名稱']) === clean(value));
      if (raw) return clean(raw.values['系統Key']);
    }
    return terms.map(domain, value, where);
  } });
  relations(all);
  const courses = all.courses.filter(r => r.published);
  const courseIds = new Set(courses.map(r => r.course_id));
  const sessions = all.sessions.filter(r => r.published && courseIds.has(r.course_id));
  const sessionIds = new Set(sessions.map(r => r.session_id));
  const instructors = all.instructors.filter(r => r.published);
  const media = all.media.filter(r => r.published && safePrivacy.has(r.privacy_status) && safeUsage.has(r.usage_scope)
    && (!r.course_id || courseIds.has(r.course_id)) && (!r.session_id || sessionIds.has(r.session_id))
    && (r.media_type !== 'instructor_photo' || instructors.some(i => i.photo_media_id === r.media_id)));
  const mediaIds = new Set(media.map(r => r.media_id));
  // References to deliberately hidden images must not survive projection.
  for (const c of courses) if (!mediaIds.has(c.cover_media_id)) c.cover_media_id = null;
  for (const i of instructors) if (!mediaIds.has(i.photo_media_id)) i.photo_media_id = null;
  const visible = { courses, media, sessions, instructors, faq: all.faq.filter(r => r.published && (!r.course_id || courseIds.has(r.course_id))) };
  const payload = Object.fromEntries(Object.entries(TABLES).map(([table, name]) => [name, visible[name].map(row => {
    const out = Object.fromEntries(fields.filter(f => f.table === table && f.visibility !== 'private' && !BUILD_ONLY.has(f.key)).map(f => [f.key, row[f.key]]));
    if (name === 'media') out.asset_path_or_url = resolveAsset(out.asset_path_or_url, assetBase);
    return out;
  }).sort((a, b) => a.sort_order - b.sort_order)]));
  const contract = { fields, enums: terms.domains };
  validateGenerated(payload, contract);
  return { payload, contract, counts: Object.fromEntries(FILES.map(n => [n, { source: all[n].length, output: payload[n].length }])) };
}

export function validateGenerated(payload, contract) {
  if (!contract || !Array.isArray(contract.fields) || !contract.enums) fail('Generated', 'validation contract missing');
  if (contract.fields.length !== baseline.length) fail('Generated', 'validation contract incomplete');
  for (const b of baseline) {
    const f = contract.fields.find(f => f.table === b.table && f.key === b.key);
    if (!f || ['type', 'required', 'vocab', 'visibility', 'list'].some(k => f[k] !== b[k])) fail('Generated', 'validation contract altered');
  }
  if (Object.keys(payload).length !== FILES.length) fail('Generated', 'unexpected file set');
  for (const [table, name] of Object.entries(TABLES)) {
    if (!Array.isArray(payload[name])) fail('Generated', 'missing content array');
    const fields = contract.fields.filter(f => f.table === table && f.visibility !== 'private' && !BUILD_ONLY.has(f.key));
    for (const row of payload[name]) {
      if (!row || typeof row !== 'object' || Object.keys(row).some(k => !fields.some(f => f.key === k))) fail(name, 'unexpected or private field');
      for (const f of fields) {
        const v = row[f.key];
        if (v === undefined || (f.required && v === null)) fail(name, 'missing generated field');
        if (v === null) continue;
        if (f.list) { if (!Array.isArray(v) || !v.every(v => typeof v === 'string' && v.trim())) fail(name, 'invalid list'); }
        else if (f.type === 'boolean') { if (typeof v !== 'boolean') fail(name, 'invalid Boolean'); }
        else if (['integer', 'number'].includes(f.type)) { if (typeof v !== 'number' || !Number.isFinite(v) || (f.type === 'integer' && !Number.isSafeInteger(v))) fail(name, 'invalid Number'); }
        else if (typeof v !== 'string' || !v || v !== v.trim()) fail(name, 'invalid string');
        if (f.type === 'date') date(v, name);
        if (f.type === 'enum' && !contract.enums[f.vocab]?.includes(v)) fail(name, 'invalid generated enum');
        if (f.key === 'difficulty_level' && (v < 1 || v > 5)) fail(name, 'invalid difficulty');
      }
      if (row.published !== true) fail(name, 'unpublished row in public payload');
    }
  }
  relations(payload);
  for (const m of payload.media) {
    if (!safePrivacy.has(m.privacy_status) || !safeUsage.has(m.usage_scope)) fail('Media', 'unsafe media in public payload');
    if (!(m.asset_path_or_url.startsWith('/work/') || m.asset_path_or_url.startsWith('https://'))) fail('Media', 'unsafe public asset');
    if (m.asset_path_or_url.startsWith('/work/')) resolveAsset(m.asset_path_or_url.slice(6));
    else resolveAsset(m.asset_path_or_url);
  }
  return true;
}

export function readPayload(directory) {
  const files = fs.readdirSync(directory).sort();
  if (JSON.stringify(files) !== JSON.stringify(FILES.map(n => `${n}.json`).sort())) fail('Generated', 'unexpected or missing generated file');
  return Object.fromEntries(FILES.map(n => [n, JSON.parse(fs.readFileSync(`${directory}/${n}.json`, 'utf8'))]));
}
