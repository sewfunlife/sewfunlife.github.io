import fs from 'node:fs';
import path from 'node:path';
import { digest } from '../scripts/content/storage.mjs';
import { readPayload, validateGenerated } from '../scripts/content/adapter.mjs';
import type { Asset, Course, Media, Session, Instructor, FAQ, Site } from './types';

// Server/build-time only. No fallback to projects.json or images.json.
const root = process.cwd();
export const site = JSON.parse(fs.readFileSync(path.join(root, 'content/site.json'), 'utf8')) as Site;
const receipt = JSON.parse(fs.readFileSync(path.join(root, '.cache/sewfunlife-content/receipt.json'), 'utf8'));
const localAllowed = process.env.NODE_ENV === 'development' || (process.env.SEWFUNLIFE_LOCAL_BUILD === '1' && !process.env.CI && !process.env.GITHUB_ACTIONS && !process.env.VERCEL);
if (receipt.source !== 'live' && !localAllowed) throw new Error('Site requires live synchronized content');
const data = readPayload(path.join(root, 'content/generated')) as {
  courses: Course[]; media: Media[]; sessions: Session[]; instructors: Instructor[]; faq: FAQ[];
};
for (const [name, rows] of Object.entries(data)) {
  if (receipt.hashes?.[name] !== digest(rows)) throw new Error('Generated content does not match validated receipt');
}
validateGenerated(data, receipt.contract);
export const { courses, media, sessions, instructors, faq } = data;
export const getCourse = (slug: string) => courses.find(c => c.slug === slug);

/** Presentation-only image shape; Source of Truth remains Media. */
function imageAsset(m: Media): Asset {
  return { src: m.asset_path_or_url, w: m.width ?? 1200, h: m.height ?? 1200, key: m.media_id, label: m.alt ?? '' };
}
export function courseMedia(course: Course, type: string): Media[] {
  return media.filter(m => m.course_id === course.course_id && m.media_type === type && !m.session_id);
}
export function assets(slug: string, type: string): Asset[] {
  const course = getCourse(slug);
  return course ? courseMedia(course, type).map(imageAsset) : [];
}
export function heroAsset(slug: string): Asset | undefined {
  const c = getCourse(slug);
  if (!c) return undefined;
  const m = media.find(m => m.media_id === c.cover_media_id && m.course_id === c.course_id && m.media_type === 'course_cover');
  const fallback = courseMedia(c, 'course_cover')[0] ?? courseMedia(c, 'work_showcase')[0];
  return m ? imageAsset(m) : fallback ? imageAsset(fallback) : undefined;
}
export function wall(course: Course): Array<Asset & { caption?: string }> {
  return courseMedia(course, 'work_showcase').map(m => ({ ...imageAsset(m), caption: m.caption ?? undefined }));
}
export function neighbours(slug: string) {
  const i = courses.findIndex(c => c.slug === slug);
  return i < 0 ? { prev: undefined, next: undefined } : { prev: courses[(i - 1 + courses.length) % courses.length], next: courses[(i + 1) % courses.length] };
}
export const assetCount = () => media.length;
