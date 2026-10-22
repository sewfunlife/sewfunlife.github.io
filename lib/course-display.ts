import type { Course } from './types';

export function duration(course: Course): string {
  const min = course.duration_min_minutes, max = course.duration_max_minutes;
  if (min === null && max === null) return course.duration_note ?? '';
  const text = min === max ? `${min} 分鐘` : min === null ? `最長 ${max} 分鐘` : max === null ? `${min} 分鐘起` : `${min}–${max} 分鐘`;
  return [text, course.duration_note].filter(Boolean).join('，');
}
export const difficulty = (c: Course) => c.difficulty_level === null ? '' : '★'.repeat(c.difficulty_level) + '☆'.repeat(5 - c.difficulty_level);
export function courseFacts(c: Course) {
  // Participant counts are internal, so only the public note becomes copy.
  return [
    { label: '課程時間', value: duration(c) }, { label: '難易程度', value: difficulty(c) },
    { label: '適合人數', value: c.participant_note }, { label: '成品內容', value: c.finished_item },
    { label: '適合場域', value: c.suitable_contexts },
  ].filter((f): f is { label: string; value: string } => !!f.value);
}
