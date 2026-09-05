import {
  Archivo,
  Cinzel,
  Cormorant_Garamond,
  Montserrat,
  Playfair_Display,
  Syne,
} from "next/font/google";

/* --------------------------------------------------------------------------
 * The site's own voice.
 *
 * Syne was drawn for an art centre and has the slightly wrong-looking wide
 * bowls that mark it as a designer's face rather than a default. Archivo does
 * the reading: a grotesque with enough width to hold small captions open.
 * ----------------------------------------------------------------------- */

export const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
  display: "swap",
});

export const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-archivo",
  display: "swap",
});

/* --------------------------------------------------------------------------
 * Specimen faces.
 *
 * Each project declares the typefaces it was set in, so the specimen is shown
 * in the real face rather than described in words.
 *
 * A specimen only ever renders "Aa" and a family name, so one weight per face
 * is enough. `preload: false` keeps them off the critical path — they load
 * after the artwork, on project pages only, and never block first paint.
 *
 * These deliberately use the normal `latin` subset rather than next/font's
 * `text` option. Subsetting to a fixed alphabet would be smaller, but this is
 * a template: the moment someone names a typeface containing a digit or an
 * accented character, the missing glyphs would silently disappear.
 *
 * next/font is a compile-time transform, so every option has to be a literal.
 * That is why the shared values are repeated rather than spread.
 * ----------------------------------------------------------------------- */

export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-montserrat",
  display: "swap",
  preload: false,
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});

export const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-cinzel",
  display: "swap",
  preload: false,
});

/** Maps a family name in the content JSON to the CSS variable that renders it. */
export const SPECIMEN_FONTS: Record<string, string> = {
  Montserrat: "var(--font-montserrat)",
  "Cormorant Garamond": "var(--font-cormorant)",
  "Playfair Display": "var(--font-playfair)",
  Cinzel: "var(--font-cinzel)",
};

/** Every specimen variable, applied once on the project page wrapper. */
export const specimenClassNames = [
  montserrat.variable,
  cormorant.variable,
  playfair.variable,
  cinzel.variable,
].join(" ");

/**
 * Falls back to the display face when a project names a typeface this template
 * does not bundle, so an unknown family degrades instead of breaking the page.
 */
export function specimenFamily(family: string): string {
  return SPECIMEN_FONTS[family] ?? "var(--font-syne)";
}
