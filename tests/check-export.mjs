// Run after an explicit local build or a successful live build.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { readPayload } from '../scripts/content/adapter.mjs';
const payload = readPayload('content/generated');
const home = fs.readFileSync('out/index.html','utf8');
const pages=[];
for(const course of payload.courses){
 const file=`out/work/${course.slug}/index.html`;
 const html=fs.readFileSync(file,'utf8');
 assert.ok(html.includes(course.title),'Course title missing');
 assert.match(html,/<h1\b/,'Course h1 missing');
 assert.ok(home.includes(`/work/${course.slug}/`),'Home Course link missing');
 assert.ok(html.includes('/#work'),'Return link missing');
 const hero=payload.media.find(m=>m.media_id===course.cover_media_id);
 if(hero) assert.ok(html.includes(hero.asset_path_or_url),'Course cover missing');
 const works=payload.media.filter(m=>m.course_id===course.course_id&&m.media_type==='work_showcase');
 if(works.length) assert.ok(html.includes('作品展示'),'Showcase mislabeled');
 pages.push({route:`/work/${course.slug}/`,title:true,homeLink:true,returnLink:true,cover:!!hero,showcase:works.length});
}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const files=walk('out').filter(p=>/\.(html|txt|js|json)$/.test(p));
const forbidden=['material_cost_per_person','drive_folder_url','source_url','PRIVATE_MARKER','PRIVATE_INTERNAL_NOTE','UNPUBLISHED_INSTRUCTOR_MARKER'];
const text=files.map(p=>fs.readFileSync(p,'utf8')).join('\n');
for(const key of forbidden)assert.ok(!text.includes(key),`Private data in static export: ${key}`);
const report={source:JSON.parse(fs.readFileSync('.cache/sewfunlife-content/receipt.json','utf8')).source,counts:Object.fromEntries(Object.entries(payload).map(([k,v])=>[k,v.length])),pages,staticFilesScanned:files.length,privacyScan:true,browserVisualQA:'NOT VERIFIED: Chromium unavailable'};
fs.mkdirSync('docs/evidence',{recursive:true});fs.writeFileSync('docs/evidence/WORK-2.7E-01_export.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
