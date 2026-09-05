/** Shapes of the JSON in `content/`. Edit the JSON, not this file. */

export type Social = {
  instagram?: string;
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

export type Swatch = {
  hex: string;
  name?: string;
};

export type TypeSpec = {
  family: string;
  styles: string[];
};

/** One image in the mood-board wall, with its curator's label. */
export type Plate = {
  key: string;
  title: string;
  caption: string;
};

export type Section = {
  heading: string;
  body: string;
};

export type Step = {
  n: string;
  title: string;
  body: string;
};

export type Project = {
  slug: string;
  title: string;
  displayTitle: string;
  kind: "moodboard" | "campaign";
  discipline: string;
  tagline: string;
  summary: string;
  keywords: string[];
  palette: Swatch[];
  typography: TypeSpec[];
  plates: Plate[];
  sections: Section[];
  steps: Step[];
  facts: string[];
};

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

export type AssetCategory = "cover" | "mood" | "app" | "deck";

export type ImageManifest = Record<string, Partial<Record<AssetCategory, Asset[]>>>;
