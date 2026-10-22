/** Site configuration and presentation types. Course data comes from Sheets. */

export type Social = {
  instagram?: string;
  threads?: string;
  facebook?: string;
  line?: string;
  behance?: string;
  linkedin?: string;
  dribbble?: string;
  phone?: string;
};

export type Service = {
  title: string;
  body: string;
};

/** Attribution shown in the footer colophon. Omit the field to hide it. */
export type Credit = {
  label: string;
  url: string;
};

export type Site = {
  name: string;
  role: string;
  email: string;
  location?: string;
  credit?: Credit;
  tagline: string;
  intro: string[];
  about: string[];
  services: Service[];
  social: Social;
  seo: {
    siteName: string;
    description: string;
    url: string;
  };
};

// Unused legacy visual helpers retain their presentation-only types.
export type Swatch = { hex: string; name?: string };
export type TypeSpec = { family: string; styles: string[] };
export type { Course, Media, Session, Instructor, FAQ } from './course-types';

/** One processed image, as emitted by scripts/optimize-images.mjs. */
export type Asset = {
  src: string;
  w: number;
  h: number;
  key: string;
  label: string;
  /** Dominant colour, shown while the file loads so the grid never flashes. */
  dom?: string;
  /** 800px-edge variant, so phones do not download the full-size file. */
  sm?: string;
  /** Real pixel width of `sm` — srcset descriptors must be true widths. */
  smW?: number;
};
