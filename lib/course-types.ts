export type Course = {
  course_id: string;
  slug: string;
  title: string;
  course_status: string;
  published: boolean;
  sort_order: number;
  category: string | null;
  short_description: string | null;
  description: string | null;
  highlights: string[] | null;
  audience: string | null;
  age_rule: string | null;
  duration_min_minutes: number | null;
  duration_max_minutes: number | null;
  duration_note: string | null;
  difficulty_level: number | null;
  participant_min: number | null;
  participant_max: number | null;
  participant_note: string | null;
  finished_item: string | null;
  suitable_contexts: string | null;
  venue_requirements: string | null;
  equipment_requirements: string | null;
  inquiry_note: string | null;
  cover_media_id: string | null;
  seo_title: string | null;
  meta_description: string | null;
  updated_at: string;
};

export type Media = {
  media_id: string;
  course_id: string | null;
  session_id: string | null;
  media_type: string;
  asset_path_or_url: string;
  alt: string | null;
  caption: string | null;
  sort_order: number;
  width: number | null;
  height: number | null;
  format: string | null;
  published: boolean;
  privacy_status: string;
  usage_scope: string;
  updated_at: string;
};

export type Session = {
  session_id: string;
  course_id: string;
  date: string;
  organization: string | null;
  location: string | null;
  audience: string | null;
  participant_count: number | null;
  title: string | null;
  intro: string | null;
  published: boolean;
  sort_order: number;
  updated_at: string;
};

export type Instructor = {
  instructor_id: string;
  name: string;
  stage_name: string | null;
  brand: string | null;
  headline: string | null;
  bio_short: string | null;
  bio_full: string | null;
  education_credentials: string | null;
  specialties: string | null;
  teaching_items: string | null;
  teaching_experience: string | null;
  assistant_experience: string | null;
  photo_media_id: string | null;
  published: boolean;
  sort_order: number;
  updated_at: string;
};

export type FAQ = {
  faq_id: string;
  course_id: string | null;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
  updated_at: string;
};
