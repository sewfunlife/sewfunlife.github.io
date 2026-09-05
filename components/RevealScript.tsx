/**
 * Drops the `no-js` class before first paint.
 *
 * This is the only thing that has to happen pre-hydration: with `no-js`
 * present the CSS keeps every revealed element visible, so a browser that
 * never runs the script still sees a complete page. Removing it early avoids
 * a flash of already-visible content that then animates in.
 *
 * It touches only <html>, which carries `suppressHydrationWarning` in the root
 * layout for exactly this reason. Everything that mutates React-rendered
 * elements lives in components/Reveal.tsx, after hydration.
 */
const SCRIPT = `document.documentElement.classList.remove('no-js')`;

export default function RevealScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
