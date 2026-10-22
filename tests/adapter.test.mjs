import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { generateKeyPairSync, verify } from 'node:crypto';
import fixture from './fixtures/workbook.json' with { type: 'json' };
import { transform, validateGenerated, resolveAsset, SHEETS } from '../scripts/content/adapter.mjs';
import { readGoogleSheets, RANGES, SECRET_NAMES, SCOPE } from '../scripts/content/google.mjs';
import { writeResult, verifyFiles, locations } from '../scripts/content/storage.mjs';

const copy = () => structuredClone(fixture);
const put = (w, sheet, row, header, value) => { w[sheet][row][w[sheet][0].indexOf(header)] = value; };
const append = (w, sheet, values) => { w[sheet].push([...values]); return w[sheet].length - 1; };
const bad = (name, mutate, pattern) => test(name, () => { const w = copy(); mutate(w); assert.throws(() => transform(w), pattern); });

test('deterministic 3/5 pipeline excludes unpublished data and private/build-only fields', () => {
  const a = transform(copy()), b = transform(copy());
  assert.deepEqual(a, b);
  assert.deepEqual(Object.fromEntries(Object.entries(a.payload).map(([k,v])=>[k,v.length])), { courses:3, media:5, sessions:0, instructors:0, faq:0 });
  const c = a.payload.courses[0];
  assert.equal(c.course_id, 'CRS-901'); assert.equal(c.course_status, 'active'); assert.equal(c.published,true);
  assert.equal(c.duration_min_minutes,60); assert.equal(c.difficulty_level,2);
  assert.deepEqual(c.highlights,['特色一','特色二']);
  assert.equal(c.description,'測試說明段落；保持一般文字。');
  assert.equal(c.category,null);
  const json = JSON.stringify(a.payload);
  for (const s of ['material_cost_per_person','drive_folder_url','source_url','PRIVATE_MARKER','PRIVATE_INTERNAL_NOTE','UNPUBLISHED_INSTRUCTOR_MARKER','legacy_source','notes']) assert.ok(!json.includes(s), s);
});

for (const [sheet,header] of [['網站_Courses','課程ID'],['網站_Media','媒體ID'],['網站_Sessions','場次ID'],['網站_Instructor','講師ID']])
  bad(`duplicate ${header} blocks even drafts`, w => append(w,sheet,w[sheet][1]), /duplicate/);
bad('duplicate slug',w=>put(w,'網站_Courses',2,'Slug','fixture-course-1'),/duplicate/);
bad('required field blank',w=>put(w,'網站_Courses',1,'課程名稱','  '),/required/);
bad('unknown Boolean',w=>put(w,'網站_Courses',1,'公開','TRUE'),/vocabulary/);
bad('invalid integer',w=>put(w,'網站_Courses',1,'最短時間（分鐘）','1.5'),/numeric/);
bad('numeric units rejected',w=>put(w,'網站_Courses',1,'材料成本／人','NT$25'),/numeric/);
bad('invalid calendar date',w=>put(w,'網站_Courses',1,'最後更新','2026-02-30'),/calendar/);
bad('ambiguous date format',w=>put(w,'網站_Courses',1,'最後更新','10/22/2026'),/YYYY/);
bad('out of range difficulty',w=>put(w,'網站_Courses',1,'難度（1–5）','6'),/difficulty/);
bad('duration order invalid',w=>put(w,'網站_Courses',1,'最短時間（分鐘）','91'),/range/);
bad('broken media Course FK',w=>put(w,'網站_Media',1,'課程ID','CRS-000'),/FK/);
bad('cover must belong to course',w=>put(w,'網站_Courses',1,'封面媒體ID','MEDIA-903'),/cover FK/);
bad('unknown controlled vocabulary',w=>put(w,'網站_Media',1,'媒體類型','不存在'),/vocabulary/);
bad('deprecated session_photo never accepted',w=>put(w,'網站_Media',1,'媒體類型','session_photo'),/vocabulary/);
bad('Terms cannot reintroduce obsolete system key',w=>{const r=w['網站_Terms'].findIndex(r=>r[2]==='session_media');put(w,'網站_Terms',r,'系統Key','session_photo');},/keys changed/);
bad('archived published contradiction',w=>put(w,'網站_Courses',1,'課程狀態','封存'),/archived/);
bad('missing public path cannot fallback private source',w=>put(w,'網站_Media',1,'資產路徑或網址',null),/required/);
bad('removed Schema row',w=>w['網站_Schema'].splice(1,1),/Schema field/);
bad('Schema privacy downgrade',w=>{const r=w['網站_Schema'].findIndex(r=>r[2]==='source_url');put(w,'網站_Schema',r,'可見層級','public');},/contract changed/);
bad('renamed data header',w=>{w['網站_Courses'][0][2]='新名稱';},/header/);
bad('undefined AG data reproduces preflight blocker',w=>{w['網站_Courses'][1][32]='2026-09-06';},/column definition/);
bad('nonwhitelisted table rejected',w=>{w['營運總覽']=[];},/whitelisted/);
bad('missing whitelist table',w=>{delete w['網站_FAQ'];},/whitelisted/);
bad('duplicate term label ambiguous',w=>{const r=w['網站_Terms'].findIndex(r=>r[2]==='work_showcase');put(w,'網站_Terms',r,'繁中顯示名稱','課程封面');},/duplicate/);
bad('duplicate FAQ IDs',w=>{w['網站_FAQ'].push(['FAQ-001',null,'課程','問題','回答','1','是','2026-10-22']);append(w,'網站_FAQ',w['網站_FAQ'][1]);},/duplicate/);
for (const state of ['待確認','停用']) bad(`Terms status ${state} blocks referenced value`,w=>{const r=w['網站_Terms'].findIndex(r=>r[2]==='course_cover');put(w,'網站_Terms',r,'狀態',state);},/vocabulary/);

test('mapping is read from Terms (no second Chinese enum map)',()=>{
  const w=copy(); const r=w['網站_Terms'].findIndex(r=>r[2]==='course_cover');
  put(w,'網站_Terms',r,'繁中顯示名稱','測試封面標籤');
  for(let row=1;row<w['網站_Media'].length;row++) if(w['網站_Media'][row][3]==='課程封面') put(w,'網站_Media',row,'媒體類型','測試封面標籤');
  assert.equal(transform(w).payload.media[0].media_type,'course_cover');
});
for (const [header,values] of [['隱私狀態',['待處理','不可公開']],['使用範圍',['社群','內部']],['公開',['否']]])
  for(const value of values) test(`${header}=${value} media excluded and cover reference cleared`,()=>{const w=copy();put(w,'網站_Media',1,header,value);const p=transform(w).payload;assert.equal(p.media.length,4);assert.equal(p.courses[0].cover_media_id,null);});

test('session_media follows Session and Course visibility',()=>{
  const w=copy();put(w,'網站_Media',2,'媒體類型','課程花絮');put(w,'網站_Media',2,'場次ID','SF-FIXTURE-01');
  assert.equal(transform(w).payload.media.length,4);
  put(w,'網站_Sessions',1,'公開','是');assert.equal(transform(w).payload.sessions.length,1);assert.equal(transform(w).payload.media.length,5);
  put(w,'網站_Courses',1,'公開','否');const p=transform(w).payload;assert.equal(p.sessions.length,0);assert.equal(p.media.length,3);
});
bad('session media without Session',w=>put(w,'網站_Media',2,'媒體類型','課程花絮'),/requires Session/);
bad('mismatched Course/Session',w=>{put(w,'網站_Media',2,'媒體類型','課程花絮');put(w,'網站_Media',2,'場次ID','SF-FIXTURE-01');put(w,'網站_Media',2,'課程ID','CRS-902');},/Session FK/);
test('Instructor photo reverse relation is gated by Instructor publication',()=>{
  const w=copy();const row=append(w,'網站_Media',w['網站_Media'][1]);
  for(const [h,v] of Object.entries({'媒體ID':'MEDIA-PHOTO','課程ID':null,'媒體類型':'講師照片'}))put(w,'網站_Media',row,h,v);
  put(w,'網站_Instructor',1,'照片媒體ID','MEDIA-PHOTO');assert.equal(transform(w).payload.media.length,5);
  put(w,'網站_Instructor',1,'公開','是');const p=transform(w).payload;assert.equal(p.instructors.length,1);assert.equal(p.media.length,6);
});
test('FAQ 0 rows, global FAQ, course FAQ and visibility',()=>{
  const w=copy();w['網站_FAQ'].push(['FAQ-001',null,'課程','問題','回答','1','是','2026-10-22']);assert.equal(transform(w).payload.faq.length,1);
  put(w,'網站_FAQ',1,'課程ID','CRS-901');put(w,'網站_Courses',1,'公開','否');assert.equal(transform(w).payload.faq.length,0);
  put(w,'網站_FAQ',1,'課程ID','CRS-404');assert.throws(()=>transform(w),/FK/);
});
for(const input of ['../private.png','//private.invalid/a','http://example.invalid/a','a/../b','a%2Fb','data:image/png;base64,AAA','a\\b']) test(`unsafe asset ${input}`,()=>assert.throws(()=>resolveAsset(input),/unsafe/));
test('relative assets use configured HTTPS base or public work root',()=>{assert.equal(resolveAsset('courses/a.webp'),'/work/courses/a.webp');assert.equal(resolveAsset('courses/a.webp','https://assets.example.invalid/root'),'https://assets.example.invalid/root/courses/a.webp');});

test('generated validator rejects injected private fields and unsafe media',()=>{
  const {payload,contract}=transform(copy());const clone=structuredClone(payload);clone.courses[0].material_cost_per_person=25;
  assert.throws(()=>validateGenerated(clone,contract),/private field/);
  payload.media[0].privacy_status='pending';assert.throws(()=>validateGenerated(payload,contract),/unsafe media/);
});
test('generated validator rejects altered contract',()=>{const {payload,contract}=transform(copy());contract.fields.find(f=>f.key==='source_url').visibility='internal';assert.throws(()=>validateGenerated(payload,contract),/altered/);});
test('receipt catches tampering and prohibits fixture as production',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sewfunlife-test-'));try{
    await writeResult(transform(copy()),'local-fixture',dir);assert.equal((await verifyFiles(dir)).source,'local-fixture');
    await assert.rejects(verifyFiles(dir,{requireLive:true}),/Production requires/);
    const file=path.join(locations(dir).output,'media.json');await fs.writeFile(file,'[]');await assert.rejects(verifyFiles(dir),/changed/);
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});

const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const env={SEWFUNLIFE_SPREADSHEET_ID:'synthetic-workbook',GOOGLE_SERVICE_ACCOUNT_EMAIL:'fixture@synthetic.iam.gserviceaccount.com',GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:privateKey.export({type:'pkcs8',format:'pem'})};
const reply=data=>({ok:true,json:async()=>data});
test('Service Account JWT uses readonly scope; only seven exact ranges read',async()=>{
  const calls=[];
  const result=await readGoogleSheets(env,async(url,init)=>{calls.push({url:String(url),init});if(calls.length===1)return reply({access_token:'synthetic-token'});return reply({valueRanges:SHEETS.map((n,i)=>({range:RANGES[i]+'20',values:fixture[n]}))});});
  const jwt=calls[0].init.body.get('assertion');const [h,p,s]=jwt.split('.');assert.equal(JSON.parse(Buffer.from(p,'base64url')).scope,SCOPE);
  assert.equal(JSON.parse(Buffer.from(h,'base64url')).alg,'RS256');assert.ok(verify('RSA-SHA256',Buffer.from(`${h}.${p}`),publicKey,Buffer.from(s,'base64url')));
  assert.deepEqual(new URL(calls[1].url).searchParams.getAll('ranges'),RANGES);
  assert.deepEqual(Object.keys(result),SHEETS);assert.equal(transform(result).payload.media.length,5);
});
test('missing secrets fail before any network',async()=>{await assert.rejects(readGoogleSheets({},()=>assert.fail('network called')),/Missing build-time/);});
test('transport failure never exposes response body or credentials',async()=>{
  await assert.rejects(readGoogleSheets(env,async()=>({ok:false,status:403,json:async()=>({secret:'DO_NOT_PRINT'})})),e=>e.message==='Google OAuth: HTTP 403');
  await assert.rejects(readGoogleSheets({...env,GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:'PRIVATE_MARKER'},()=>assert.fail()),e=>!e.message.includes('PRIVATE_MARKER'));
});
test('incorrect response range fails',async()=>{let i=0;await assert.rejects(readGoogleSheets(env,async()=>++i===1?reply({access_token:'x'}):reply({valueRanges:SHEETS.map(n=>({range:n==='網站_Media'?'營運總覽!A4':`${n}!A4`,values:fixture[n]}))})),/unexpected response/);});
test('failed production sync removes stale artifacts and never falls back',async()=>{
  const dir=await fs.mkdtemp(path.join(os.tmpdir(),'sewfunlife-cli-'));try{
    await writeResult(transform(copy()),'local-fixture',dir);await fs.writeFile(path.join(dir,'content/projects.json'),'[{"title":"OLD_FALLBACK"}]');
    const childEnv={...process.env};SECRET_NAMES.forEach(n=>delete childEnv[n]);
    const r=spawnSync(process.execPath,[path.resolve('scripts/content.mjs'),'sync'],{cwd:dir,env:childEnv,encoding:'utf8'});
    assert.notEqual(r.status,0);assert.match(r.stderr,/Missing build-time/);await assert.rejects(fs.access(locations(dir).output));
    assert.equal(await fs.readFile(path.join(dir,'content/projects.json'),'utf8'),'[{"title":"OLD_FALLBACK"}]');
  }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('fixture command rejected in CI',()=>{const r=spawnSync(process.execPath,['scripts/content.mjs','fixture'],{env:{...process.env,CI:'true'},encoding:'utf8'});assert.notEqual(r.status,0);assert.match(r.stderr,/local-only/);});
